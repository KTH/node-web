'use strict'

const Handlebars = require('handlebars')

/** @function conditionalLogotypeSrc
 *
 * @param {string} theme -- theme on header: external, intranet or student-web
 * @param {string} proxyPrefix
 *
 * @return dynamically rendered logtype, to match header
 *
 */

Handlebars.registerHelper('conditionalLogotypeSrc', function (theme, proxyPrefix) {
  const logotype = theme === 'external' ? 'logotype-white.svg' : 'logotype-blue.svg'
  return new Handlebars.SafeString(`${proxyPrefix}/assets/logotype/${logotype}`)
})
