# Node Web

## Description

Node Web is a frontend service used together with [node-api](https://github.com/KTH/node-api). It is also a template for Node Web applications developed at KTH.

## Installation

### Install Dependencies

```sh
$ npm install
```

### Environment Variables

Sensible defaults are set and the application can run locally with a minimal `.env` file. Only `OIDC_APPLICATION_ID` and `OIDC_CLIENT_SECRET` need to be set. They can be retrieved from a key vault in Azure.

| Name                       | Description                                                                                                               | Default Value                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `SERVER_HOST_URL`          | Address to application                                                                                                    | `http://localhost:` + environment variable `SERVER_PORT`                                                               |
| `SERVER_PORT`              | The HTTP server port                                                                                                      | `3000`                                                                                                                 |
| `SERVICE_PUBLISH`          | Root path for the application                                                                                             | `/node`                                                                                                                |
| `NODE_API_KEY`             | API key to connect to `node-api`                                                                                          | `1234`                                                                                                                 |
| `NODE_API_URI`             | URI to connect to `node-api`, and additional connection parameters                                                        | `http://localhost:3001/api/node?defaultTimeout=10000`                                                                  |
| `OIDC_CONFIGURATION_URL`   | URL to OpenID Connect server, used by dependency `@kth/kth-node-passport-oidc`                                            | `https://login.ref.ug.kth.se/adfs/.well-known/openid-configuration`                                                    |
| `OIDC_APPLICATION_ID`      | Application clientID, used by dependency `@kth/kth-node-passport-oidc`                                                    | `null`                                                                                                                 |
| `OIDC_CLIENT_SECRET`       | Application secret, used by dependency `@kth/kth-node-passport-oidc`                                                      | `null`                                                                                                                 |
| `OIDC_TOKEN_SECRET`        | Application token secret, used for encrypting token for session storage, used by dependency `@kth/kth-node-passport-oidc` | `tokenSecretString`                                                                                                    |
| `OIDC_CALLBACK_URL`        | Application’s URL to callback function for standard login, used by dependency `@kth/kth-node-passport-oidc`               | `http://localhost:3000${prefixPath}/auth/login/callback`, where `prefixPath` is environment variable `SERVER_PUBLISH`  |
| `OIDC_CALLBACK_SILENT_URL` | Application’s URL to callback function for silent login, used by dependency `@kth/kth-node-passport-oidc`                 | `http://localhost:3000${prefixPath}/auth/silent/callback`, where `prefixPath` is environment variable `SERVER_PUBLISH` |
| `OIDC_CALLBACK_LOGOUT_URL` | Application’s URL to callback function for logout, used by dependency `@kth/kth-node-passport-oidc`                       | `http://localhost:3000${prefixPath}/auth/logout/callback`, where `prefixPath` is environment variable `SERVER_PUBLISH` |
| `CM_HOST_URL`              | URL to CMS, used by dependency `@kth/cortina-block`                                                                       | `https://www-r.referens.sys.kth.se/cm/`                                                                                |
| `LOGGING_ACCESS_LOG`       | Enables or disabled application access log, used by dependency `kth-node-access-log`                                      | `true`                                                                                                                 |
| `LOGGING_LEVEL`            | Application logging level, used by dependency `@kth/log`                                                                  | `debug`                                                                                                                |
| `SESSION_SECRET`           | Application’s session secret, used by dependency `@kth/session`                                                           | `1234567890`                                                                                                           |
| `SESSION_KEY`              | Application’ session key, used by dependency `@kth/session`                                                               | `node-web.sid`                                                                                                         |
| `REDIS_URI`                | URL to [Redis](https://redis.io/), used to store data from CMS and sessions                                               | `redis://localhost:6379/`                                                                                              |
| `SESSION_USE_REDIS`        | Enables or disables saving sessions to Redis                                                                              | `true`                                                                                                                 |
| `SESSION_SECURE_COOKIE`    | Enables or disables using secure cookies for sessions, should be `true` unless in local development                       | `false`                                                                                                                |
| `TOOLBAR_URL`              | URL to KTH’s personal menu, KPM                                                                                           | `https://app-r.referens.sys.kth.se/kpm/kpm.js`                                                                         |

### Local Databases

- It is recommended to use a local document database (and Redis) with [kth-node-backend](https://github.com/KTH/kth-node-backend)

## Usage

Start the application in local development mode:

```sh
$ npm run start-dev
```

## Running Tests

Tests are setup with [Jest](https://jestjs.io/). Run them with:

```
$ npm test
```

## Contact

Node Web is developed and maintained by [Team KTH Web](https://github.com/orgs/KTH/teams/web-team).
