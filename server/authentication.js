const passport = require('passport')
const log = require('kth-node-log')

/**
 * Passport will maintain persistent login sessions. In order for persistent sessions to work, the authenticated
 * user must be serialized to the session, and deserialized when subsequent requests are made.
 *
 * Passport does not impose any restrictions on how your user records are stored. Instead, you provide functions
 * to Passport which implements the necessary serialization and deserialization logic. In a typical
 * application, this will be as simple as serializing the user ID, and finding the user by ID when deserializing.
 */
passport.serializeUser((user, done) => {
  if (user) {
    log.debug('User serialized: ' + user)
    done(null, user)
  } else {
    done()
  }
})

passport.deserializeUser((user, done) => {
  if (user) {
    const { username, email, unique_name: name, memberOf } = user
    const _user = {
      username,
      displayName: Array.isArray(name) && name.length > 0 ? name[0] : null,
      email,
      // pgtIou, // ??
      roles: {
        isAdmin: memberOf.includes('app.node.admin'),
        //
        // ** You might want to add more roles, here: **
        //
        // isProgramEditor: memberOf.includes('app.program.editor'),
      },
    }
    log.debug('User deserialized: ', _user)
    done(null, _user)
  } else {
    done()
  }
})

/**
 * Usage: requireRole('isAdmin', 'isEditor')
 * @param  {...any} roles
 * @returns
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (req.user && req.user.roles) {
      if (roles.some(key => req.user.roles[key])) {
        next()
        return
      }
    }
    const error = new Error('Forbidden')
    error.status = 403
    next(error)
  }
}

module.exports.requireRole = requireRole
