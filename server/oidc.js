const { Issuer, Strategy } = require('openid-client')

module.exports = async ({ configurationUrl, clientId, clientSecret, callbackUrl, logoutUrl }) => {
  const provider = await Issuer.discover(configurationUrl)

  const client = new provider.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [callbackUrl], // The redirect url must be registered with ADFS!
    post_logout_redirect_uris: [logoutUrl], // The logout url must be registered with ADFS!
    usePKCE: 'S256',
    // response_types: ['code'], (default "code")
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
    token_endpoint_auth_method: 'client_secret_post',
  }) // => Client

  const strategy = new Strategy({ client, passReqToCallback: true, usePKCE: 'S256' }, (req, tokenSet, done) => {
    req.session['_id_token'] = tokenSet.id_token // store id_token for logout
    const claims = tokenSet.claims()
    return done(null, tokenSet.claims())
  })

  return strategy
}
