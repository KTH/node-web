const { Issuer, Strategy } = require('openid-client')
const passport = require('passport')

const {
  generators: { state },
} = require('openid-client')

/**
 * Setup OIDC with express
 *
 * // TODO
// *
// * Ta med getGroups - och den andra funktionen fr[n ldap paketet]
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

 * 
 * 
 * @param {Object} expressApp The express app instance
 * @param {Object} config
 * @param {String} config.configurationUrl
 * @param {String} config.clientId
 * @param {String} config.clientSecret
 * @param {String} config.callbackUrl
 * @param {String} config.appCallbackUrl The callback URL used for setting up the express route. Same as config.callbackUrl without host. Example: /node/auth/callback
 * @param {String} config.callbackSilentUrl
 * @param {String} config.appCallbackSilentUrl The silent callback URL used for setting up the express route. Same as config.callbackUrl without host. Example: /node/auth/silent/callback
 * @param {String} config.logoutUrl
 * @param {String} config.defaultRedirect Fallback if no next url is supplied to login
 * @param {String} config.failureRedirect In case of error
 * @param {String} [config.anonymousCookieMaxAge=600000] If a client, on a silent login, is considered anonymous, this cookie lives this long (in milliseconds).
 *
 * @typedef {Object} middlewareAndStrategy
 * @property {Function} login - Middleware which ensures a logged in user
 * @property {Function} loginStrategy - openid-client configured strategy
 * @property {Function} silentLogin - Middleware which  a logged in user
 * @property {Function} loginSilentStrategy - openid-client configured strategy for silent authentication
 * @returns {middlewareAndStrategy}
 */

module.exports = (
  expressApp,
  {
    configurationUrl,
    clientId,
    clientSecret,
    callbackUrl,
    appCallbackUrl,
    callbackSilentUrl,
    appCallbackSilentUrl,
    logoutUrl,
    defaultRedirect,
    failureRedirect,
    anonymousCookieMaxAge = 600000,
  }
) => {
  expressApp.use(passport.initialize())
  expressApp.use(passport.session())

  const oidcFunctions = {}

  const oidcClient = Issuer.discover(configurationUrl).then(
    provider =>
      new provider.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [callbackUrl], // The redirect url must be registered with ADFS!
        post_logout_redirect_uris: [logoutUrl], // The logout url must be registered with ADFS!
        usePKCE: 'S256',
        // response_types: ['code'], (default "code")
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
        token_endpoint_auth_method: 'client_secret_post',
      })
  )

  oidcFunctions.loginStrategy = async function () {
    const client = await oidcClient
    const loginStrategy = new Strategy({ client, passReqToCallback: true, usePKCE: 'S256' }, (req, tokenSet, done) => {
      req.session['_id_token'] = tokenSet.id_token // store id_token for logout
      return done(null, tokenSet.claims())
    })
    passport.use('oidc', loginStrategy)
    return loginStrategy
  }

  oidcFunctions.loginSilentStrategy = async function () {
    const client = await oidcClient
    const loginSilentStrategy = new Strategy(
      { client, params: { prompt: 'none', redirect_uri: callbackSilentUrl }, passReqToCallback: true, usePKCE: 'S256' },
      (req, tokenSet, done) => {
        req.session['_id_token'] = tokenSet.id_token // store id_token for logout
        const claims = tokenSet.claims()
        return done(null, tokenSet.claims())
      }
    )

    passport.use('oidcSilent', loginSilentStrategy)
    return loginSilentStrategy
  }

  oidcFunctions.login = async (req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    const strategyIsReady = await oidcFunctions.loginStrategy()
    // eslint-disable-next-line no-shadow
    return ((req, res, next) => {
      if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        return next()
      }

      const newState = state()

      req.session.redirects = req.session.redirects || {}

      req.session.redirects[newState] = req.originalUrl || req.url

      passport.authenticate('oidc', { state: newState })(req, res, next)
    })(req, res, next)
  }

  oidcFunctions.silentLogin = async (req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    const silentStrategyIsReady = await oidcFunctions.loginSilentStrategy()
    // eslint-disable-next-line no-shadow
    return ((req, res, next) => {
      if (req.session.anonymous || (typeof req.isAuthenticated === 'function' && req.isAuthenticated())) {
        return next()
      }

      const newState = state()

      req.session.redirects = req.session.redirects || {}

      req.session.redirects[newState] = req.originalUrl || req.url

      passport.authenticate('oidcSilent', { state: newState })(req, res, next)
    })(req, res, next)
  }

  expressApp.get(appCallbackUrl, (req, res, next) => {
    const nextUrl = req.session.redirects[req.query.state] || defaultRedirect
    delete req.session.redirects[req.query.state]
    passport.authenticate('oidc', {
      successRedirect: nextUrl,
      failureRedirect, // Where should we send a user when this fails?
    })(req, res, next)
  })

  expressApp.get(appCallbackSilentUrl, (req, res, next) => {
    // https://auth0.com/docs/authorization/configure-silent-authentication

    // Possible error codes from ADFS
    //  login_required
    //  consent_required
    //  interaction_required

    const nextUrl = req.session.redirects[req.query.state] || defaultRedirect
    delete req.session.redirects[req.query.state]

    if (req.query.error) {
      if (
        req.query.error === 'login_required' ||
        req.query.error === 'consent_required' ||
        req.query.error === 'interaction_required'
      ) {
        req.session.anonymous = true
        // Setting a 'short' cookie max age so we re-authenticate soon
        req.session.cookie.maxAge = anonymousCookieMaxAge
        return res.redirect(nextUrl)
        // eslint-disable-next-line no-else-return
      } else {
        // show error_description on error page?
      }
    }

    passport.authenticate('oidcSilent', {
      successRedirect: nextUrl,
      failureRedirect, // Where should we send a user when this fails?
    })(req, res, next)
  })

  return oidcFunctions
}
