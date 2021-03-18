/* eslint-disable import/order */
const server = require('kth-node-server')

// Now read the server config etc.
const config = require('./configuration').server
require('./api')
const AppRouter = require('kth-node-express-routing').PageRouter
const { getPaths } = require('kth-node-express-routing')
const url = require('url')

if (config.appInsights && config.appInsights.instrumentationKey) {
  const appInsights = require('applicationinsights')

  appInsights
    .setup(config.appInsights.instrumentationKey)
    .setAutoDependencyCorrelation(false)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(false)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .start()
}

const _addProxy = uri => `${config.proxyPrefixPath.uri}${uri}`

// Expose the server and paths
server.locals.secret = new Map()
module.exports = server
module.exports.getPaths = () => getPaths()

/* ***********************
 * ******* LOGGING *******
 * ***********************
 */
const log = require('kth-node-log')
const packageFile = require('../package.json')

const logConfiguration = {
  name: packageFile.name,
  app: packageFile.name,
  env: process.env.NODE_ENV,
  level: config.logging.log.level,
  console: config.logging.console,
  stdout: config.logging.stdout,
  src: config.logging.src,
}

log.init(logConfiguration)

/* **************************
 * ******* TEMPLATING *******
 * **************************
 */
const exphbs = require('express-handlebars')
const path = require('path')

server.set('views', path.join(__dirname, '/views'))
server.set('layouts', path.join(__dirname, '/views/layouts'))
server.set('partials', path.join(__dirname, '/views/partials'))
server.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'publicLayout',
    layoutsDir: server.settings.layouts,
    partialsDir: server.settings.partials,
  })
)
server.set('view engine', 'handlebars')
// Register handlebar helpers
require('./views/helpers')

/* ******************************
 * ******* ACCESS LOGGING *******
 * ******************************
 */
const accessLog = require('kth-node-access-log')

server.use(accessLog(config.logging.accessLog))

/* ****************************
 * ******* STATIC FILES *******
 * ****************************
 */
const browserConfig = require('./configuration').browser
const browserConfigHandler = require('kth-node-configuration').getHandler(browserConfig, getPaths())
const express = require('express')

// Removes the "X-Powered-By: Express header" that shows the underlying Express framework
server.disable('x-powered-by')

// helper
function setCustomCacheControl(res, path2) {
  if (express.static.mime.lookup(path2) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'no-cache')
  }
}

// Files/statics routes--
// Map components HTML files as static content, but set custom cache control header, currently no-cache to force If-modified-since/Etag check.
server.use(
  _addProxy('/static/js/components'),
  express.static('./dist/js/components', { setHeaders: setCustomCacheControl })
)

// Expose browser configurations
server.use(_addProxy('/static/browserConfig'), browserConfigHandler)
// Files/statics routes
server.use(_addProxy('/static/kth-style'), express.static('./node_modules/kth-style/dist'))
// Map static content like images, css and js.
server.use(_addProxy('/static'), express.static('./dist'))

server.use(_addProxy('/static/icon/favicon'), express.static('./public/favicon.ico'))

// Return 404 if static file isn't found so we don't go through the rest of the pipeline
server.use(_addProxy('/static'), (req, res, next) => {
  const error = new Error('File not found: ' + req.originalUrl)
  error.status = 404
  next(error)
})

// QUESTION: Should this really be set here?
// http://expressjs.com/en/api.html#app.set
server.set('case sensitive routing', true)

/* *******************************
 * ******* REQUEST PARSING *******
 * *******************************
 */
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieParser())

/* ***********************
 * ******* SESSION *******
 * ***********************
 */
const session = require('kth-node-session')

const options = config.session
options.sessionOptions.secret = config.sessionSecret
server.use(session(options))

/* ************************
 * ******* LANGUAGE *******
 * ************************
 */
const { languageHandler } = require('kth-node-web-common/lib/language')

server.use(config.proxyPrefixPath.uri, languageHandler)

/* ******************************
 ***** AUTHENTICATION - OIDC ****
 ****************************** */

const passport = require('passport')

server.use(passport.initialize())
server.use(passport.session())

const setupOidc = async () => {
  const { loginStrategy, loginSilentStrategy } = await require('./oidc')(config.oidc)
  passport.use('oidc', loginStrategy)
  passport.use('oidcSilent', loginSilentStrategy)
}

setupOidc()

const LOGIN_ROUTE_URL = _addProxy('/auth/login')
const NEXT_URL_PARAM = 'nextUrl'

const login = (req, res, next) => {
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
    return next()
  }

  const newState = state()

  req.session.redirects = req.session.redirects || {}

  req.session.redirects[newState] = req.originalUrl || req.url

  passport.authenticate('oidc', { state: newState })(req, res, next)
}

const {
  generators: { state },
} = require('openid-client')

server.get(LOGIN_ROUTE_URL, login, (req, res, next) => {
  res.redirect(_addProxy(''))

  // const callbackWithNextUrl = new URL(config.oidc.callbackUrl)
  // if (req.query[NEXT_URL_PARAM]) {
  //   callbackWithNextUrl.searchParams.append(NEXT_URL_PARAM, req.query[NEXT_URL_PARAM]) // // URL encode ???
  // }
  // passport.authenticate('oidc', { redirect_uri: callbackWithNextUrl.href })(req, res, next)
  // const crypto = require('crypto')
  // const newState = state()
  // req.session.redirects = req.session.redirects || {}
  // req.session.redirects[newState] = req.query[NEXT_URL_PARAM]
  // passport.authenticate('oidc', { state: newState })(req, res, next)
  // passport.authenticate('oidc')(req, res, next)
})

server.get(_addProxy('/auth/callback'), (req, res, next) => {
  const nextUrl = req.session.redirects[req.query.state]
  delete req.session.redirects[req.query.state]
  passport.authenticate('oidc', {
    successRedirect: nextUrl,
    failureRedirect: _addProxy(''), // Where should we send a user when this fails?
  })(req, res, next)
})

const LOGIN_SILENT_ROUTE_URL = _addProxy('/auth/silent/login')

const silentLogin = (req, res, next) => {
  if (req.session.anonymous || (typeof req.isAuthenticated === 'function' && req.isAuthenticated())) {
    return next()
  }

  const loginSilentWithNextUrl = new URL(LOGIN_SILENT_ROUTE_URL)
  loginSilentWithNextUrl.searchParams.append(NEXT_URL_PARAM, req.originalUrl || req.url) // // URL encode ???
  return res.redirect(loginSilentWithNextUrl.href)
}

server.get(LOGIN_SILENT_ROUTE_URL, (req, res, next) => {
  passport.authenticate('oidcSilent')(req, res, next)
})

server.get(_addProxy('/auth/silent/callback'), (req, res, next) => {
  // https://auth0.com/docs/authorization/configure-silent-authentication

  // Possible error codes from ADFS
  //  login_required
  //  consent_required
  //  interaction_required

  if (req.query.error) {
    if (
      req.query.error === 'login_required' ||
      req.query.error === 'consent_required' ||
      req.query.error === 'interaction_required'
    ) {
      req.session.anonymous = true
      // Setting a 'short' cookie max age so we re-authenticate soon
      req.session.cookie.maxAge = 60000 // 1 minute
      return res.redirect(req.session.returnTo)
      // eslint-disable-next-line no-else-return
    } else {
      // show error_description on error page?
    }
  }

  passport.authenticate('oidcSilent', {
    successRedirect: req.session.returnTo,
    failureRedirect: _addProxy(''), // Where should we send a user when this fails?
  })(req, res, next)
})

// TODO

// *
// * Ta med getGroups - och den andra funktionen fr[n ldap paketet]
// * Kommer verkligen det att fungera att spara returnTo i sessionen? Vad händer vid flera slagningar. Exempel i profiles
// * Skriv en ny requireRole (Ser grupperna ut som f;r LDAP, beh;ver vi https://github.com/KTH/kth-node-ldap/blob/master/lib/utils/hasGroup.js)
// * Bör vi skriva ett standardsätt att konstruera en användare, typ:
// * Secure cookie?
// https://developers.google.com/identity/protocols/oauth2/openid-connect#createxsrftoken
// https://github.com/panva/node-openid-client/issues/83

// unpackLdapUser: (ldapUser, pgtIou) => {
//   //       return {
//   //         username: ldapUser.ugUsername,
//   //         displayName: ldapUser.displayName,
//   //         email: ldapUser.mail,
//   //         pgtIou,
//   //         // This is where you can set custom roles
//   //         isAdmin: hasGroup(config.auth.adminGroup, ldapUser),
//   //       }

/* ******************************
 * ******* CORTINA BLOCKS *******
 * ******************************
 */
server.use(
  config.proxyPrefixPath.uri,
  require('kth-node-web-common/lib/web/cortina')({
    blockUrl: config.blockApi.blockUrl,
    proxyPrefixPath: config.proxyPrefixPath.uri,
    hostUrl: config.hostUrl,
    redisConfig: config.cache.cortinaBlock.redis,
  })
)

/* ********************************
 * ******* CRAWLER REDIRECT *******
 * ********************************
 */
const excludePath = _addProxy('(?!/static).*')
const excludeExpression = new RegExp(excludePath)
server.use(
  excludeExpression,
  require('kth-node-web-common/lib/web/crawlerRedirect')({
    hostUrl: config.hostUrl,
  })
)

/* **********************************
 * ******* APPLICATION ROUTES *******
 * **********************************
 */
const { System, Sample } = require('./controllers')
const { requireRole } = require('./authentication')

// System routes
const systemRoute = AppRouter()
systemRoute.get('system.monitor', _addProxy('/_monitor'), System.monitor)
systemRoute.get('system.about', _addProxy('/_about'), System.about)
systemRoute.get('system.paths', _addProxy('/_paths'), System.paths)
systemRoute.get('system.robots', '/robots.txt', System.robotsTxt)
server.use('/', systemRoute.getRouter())

// App routes
const appRoute = AppRouter()
appRoute.get('node.page', _addProxy('/silent'), silentLogin, Sample.getIndex)
appRoute.get('node.index', _addProxy('/'), login, Sample.getIndex)
appRoute.get('node.page', _addProxy('/:page'), login, Sample.getIndex)
appRoute.get(
  'system.gateway',
  _addProxy('/gateway'),
  // getServerGatewayLogin('/'),
  requireRole('isAdmin'),
  Sample.getIndex
)
server.use('/', appRoute.getRouter())

// Not found etc
server.use(System.notFound)
server.use(System.final)

// Register handlebar helpers
require('./views/helpers')
