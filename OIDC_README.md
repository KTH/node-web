# OpenID Connect Genomgång

### The basics

Vi använder passport för autentisering i våra Express-baserade Node.js appar.

Passport använder strategier för att autentisera anrop.

Läs mer: http://www.passportjs.org/docs/configure/

Det nya paketet openid-client ger oss en färdig strategi som vi föder med en client (konfigurerad att gå mot våran OpenIDConnect server]).

Dvs:

- Hämta ut en OpenIdConnect issuer/provider via discovery
  `const provider = await Issuer.discover(openIdConfigurationUrl);`

- Via providern skapar vi en Client som vi konfigurerar med
- clientId
- clientSecret
- redirectUris
- mm
- Vi skapar en Strategy med ovanstående client samt en funktion som vi själva implementerar för att avgöra ifall användaren är ok.
- Vi confar upp denna strategi i passport med namnet "oidc": `passport.use("oidc", strategy);`

Som standard hamnar resultatet på req.user, något som skiljer sig från vår kod idag:

`const ldapUser = req.session.authUser`

**_Fråga_**

_Ska vi bygga upp ett likadant objekt för att göra den initiala överången enklare? Alternativet är att varje app samt eventuella externa libs behöver går igenom vid migrering til OIDC_

### Våra routes

Exempel på hur det hanteras idag på en route:

`appRoute.post( 'profiles.postProfile', config.proxyPrefixPath.uri + '/:username/edit/post', serverLogin, requireRole('isOwner', 'isAdmin', 'isModerator'), Profile.postProfile )`

**serverLogin** är en middleware som sköter inloggningen och skickar vidare ifall användaren är inloggad.

### Vad behöver vi för middleware?

#### serverLogin

Ska klara av att kontrollera ifall en användare är inloggad, och sen tvinga logga in användaren eller skicka vidare användaren rätt URL

#### gatewayLogin

Ska klara av att kontrollera ifall en användare är inloggad och sen skicka vidare användaren till nästa middleware

I CAS fungerar detta genom att

**_Fråga_**

_Finns konceptet gateway i OpenId Connect_

Ja! "prompt=none"

https://auth0.com/docs/authorization/configure-silent-authentication

Från Stefan:

I exemplet finns resource parametern specad, prompt ska nog läggas in på motsvarande sätt på samma ställe:
// Uncomment if you want to call the ADFS userinfo endpoint
// {
// resource: 'urn:microsoft:userinfo',
// }
En annan sak ni bör ändra på i exemplet är att explicit sätta
token_endpoint_auth_method: 'client_secret_post',
istället för att använda default som är
token_endpoint_auth_method: 'client_secret_basic',

####

https://stackoverflow.com/questions/41475626/passport-authenticate-successredirect-condition
