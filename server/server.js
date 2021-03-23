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

const { login, silentLogin, doLogoutUser } = require('./oidc')(server, {
  ...config.oidc,
  appCallbackUrl: _addProxy('/auth/callback'),
  appCallbackSilentUrl: _addProxy('/auth/silent/callback'),
  defaultRedirect: _addProxy(''),
  failureRedirect: _addProxy(''),
})

// const { login, silentLogin } = setupOidc()

const LOGIN_ROUTE_URL = _addProxy('/auth/login')
// eslint-disable-next-line no-unused-vars
server.get(LOGIN_ROUTE_URL, login, (req, res, next) => res.redirect(_addProxy('')))

const LOGIN_SILENT_ROUTE_URL = _addProxy('/auth/silent/login')
// eslint-disable-next-line no-unused-vars
server.get(LOGIN_SILENT_ROUTE_URL, silentLogin, (req, res, next) => res.redirect(_addProxy('')))

server.get(_addProxy('/logout'), doLogoutUser)

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

const _showDebug = (req, res, next) => {
  const { anonymous } = req.session
  const { url: _url, user } = req
  console.log('\n', { url: _url, anonymous, user }, '\n')
  next()
}

// App routes
const appRoute = AppRouter()
appRoute.get('node.page', _addProxy('/silent'), silentLogin, _showDebug, Sample.getIndex)
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
