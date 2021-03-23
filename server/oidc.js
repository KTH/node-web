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
 *
 * @typedef {Object} oidcFunctions
 * @property {Promise} login - A promise which resolves to a middleware which ensures a logged in user
 * @property {Promise} silentLogin - A promise which resolves to a middleware which ensures a silent authenticated user
 * @property {Promise} loginStrategy - A promise which resolves to a openid-client configured strategy
 * @property {Promise} loginSilentStrategy - A promise which resolves to a openid-client configured strategy for silent authentication
 * @returns {oidcFunctions}
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

  /**
   * Creates a openid-client Strategy
   */
  oidcFunctions.loginStrategy = async () => {
    const client = await oidcClient
    const loginStrategy = new Strategy({ client, passReqToCallback: true, usePKCE: 'S256' }, (req, tokenSet, done) => {
      req.session._id_token = tokenSet.id_token // store id_token for logout
      const claims = tokenSet.claims()
      return done(null, claims)
    })
    passport.use('oidc', loginStrategy)
    return loginStrategy
  }

  /**
   * Creates a openid-client Strategy configured for silent authentication
   */
  oidcFunctions.loginSilentStrategy = async () => {
    const client = await oidcClient
    const loginSilentStrategy = new Strategy(
      { client, params: { prompt: 'none', redirect_uri: callbackSilentUrl }, passReqToCallback: true, usePKCE: 'S256' },
      (req, tokenSet, done) => {
        req.session._id_token = tokenSet.id_token // store id_token for logout
        const claims = tokenSet.claims()
        return done(null, claims)
      }
    )

    passport.use('oidcSilent', loginSilentStrategy)
    return loginSilentStrategy
  }

  /**
   * Setup of Express middleware
   *
   * Check if the user it authenticated or else redirect to OpenID Connect server
   * for authentication
   *
   * On a redirect this function generates a state. This is usually done inside the openid-client
   * but can also be injected into the authentication function, which is what is done here.
   *
   * The state is generated the same way as it is done inside the openid-client but in this way we
   * can store the originally requested URL in the session with a unique id, which is also sent to the
   * callback function, where we can extract the originalUrl from the session.
   *
   * Read more: https://developers.google.com/identity/protocols/oauth2/openid-connect#createxsrftoken
   */
  oidcFunctions.login = async (req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    const strategyIsReady = await oidcFunctions.loginStrategy()
    // eslint-disable-next-line no-shadow
    return ((req, res, next) => {
      if (req.user) {
        return next()
      }

      const newState = state()

      req.session.redirects = req.session.redirects || {}

      req.session.redirects[newState] = req.originalUrl || req.url

      return passport.authenticate('oidc', { state: newState })(req, res, next)
    })(req, res, next)
  }

  /**
   * Setup of Express middleware
   *
   * Check if the user is anonymous or authenticated, known as a "silent login"
   *
   * Read More: https://auth0.com/docs/authorization/configure-silent-authentication
   *
   * On a redirect this function generates a state. This is usually done inside the openid-client
   * but can also be injected into the authentication function, which is what happens here.
   *
   * The state is basically a unique random string which we send to the OpenID Connect server
   * and then used to verify the callback from the server. This to prevent request forgery.
   *
   * The state is generated the same way as it is done inside the openid-client but in this way we
   * can store the originally requested URL in the session with a unique id. This id, the state, is
   * also sent to our callback function from the OpenID Connect server, where we can extract the originalUrl from the session.
   *
   * Read more: https://developers.google.com/identity/protocols/oauth2/openid-connect#createxsrftoken
   */
  oidcFunctions.silentLogin = async (req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    const silentStrategyIsReady = await oidcFunctions.loginSilentStrategy()
    // eslint-disable-next-line no-shadow
    return ((req, res, next) => {
      if (req.session.anonymous && req.user) {
        req.session.anonymous = false
      }
      if (req.session.anonymous || req.user) {
        return next()
      }

      const newState = state()

      req.session.redirects = req.session.redirects || {}

      req.session.redirects[newState] = req.originalUrl || req.url

      return passport.authenticate('oidcSilent', { state: newState })(req, res, next)
    })(req, res, next)
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * @returns {Promise}
   */
  // eslint-disable-next-line no-unused-vars
  oidcFunctions.doLogoutUser = async (req, res, next) => {
    const client = await oidcClient
    req.session.destroy() // ??
    res.redirect(client.endSessionUrl())
  }

  /**
   * Setup of express route. Callback route to be used by OpenID Connect server
   * for authentication
   *
   * On a successful authentication the user is redirected to the original url
   */
  expressApp.get(appCallbackUrl, (req, res, next) => {
    const nextUrl = req.session.redirects[req.query.state] || defaultRedirect
    delete req.session.redirects[req.query.state]
    passport.authenticate('oidc', {
      successRedirect: nextUrl,
      failureRedirect,
    })(req, res, next)
  })

  /**
   * Setup of express route. Callback route to be used by OpenID Connect server
   * for silent authentication
   *
   * Handles error codes from OpenID Connect server if the user isn't logged in.
   * Possible error codes
   * - login_required
   * - consent_required
   * - interaction_required
   *
   * Read More: https://auth0.com/docs/authorization/configure-silent-authentication
   *
   * On a successful authentication the user is redirected to the original url
   */
  expressApp.get(appCallbackSilentUrl, (req, res, next) => {
    const nextUrl = req.session.redirects[req.query.state] || defaultRedirect
    delete req.session.redirects[req.query.state]

    if (req.query.error) {
      if (
        req.query.error === 'login_required' ||
        req.query.error === 'consent_required' ||
        req.query.error === 'interaction_required'
      ) {
        req.session.anonymous = true
        return res.redirect(nextUrl)
        // eslint-disable-next-line no-else-return
      } else {
        // TODO show error_description on error page?
      }
    }

    passport.authenticate('oidcSilent', {
      successRedirect: nextUrl,
      failureRedirect,
    })(req, res, next)
  })

  return oidcFunctions
}
