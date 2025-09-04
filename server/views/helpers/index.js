'use strict'

const registerHeaderContentHelper = require('@kth/kth-node-web-common/lib/handlebars/helpers/headerContent')
const { registerBreadcrumbHelper } = require('@kth/kth-node-web-common/lib/handlebars/helpers/breadcrumbs')
const { registerLanguageLinkHelper } = require('@kth/kth-node-web-common/lib/handlebars/helpers/languageLink')
const {
  registerConditionalLogotypeSrcHelper,
} = require('@kth/kth-node-web-common/lib/handlebars/helpers/conditionalLogotypeSrc')
const log = require('@kth/log')
const config = require('../../configuration').server
const packageFile = require('../../../package.json')
const { dockerVersion: buildId } = require('../../../config/version')

let { version } = packageFile

try {
  version = version + '-' + buildId
} catch (err) {
  log.error(err.message)
}

/*
  Register standard helpers:

    - withVersion
    - extend
    - prefixScript
    - prefixStyle
    - render

*/
registerHeaderContentHelper({
  proxyPrefixPath: config.proxyPrefixPath.uri,
  version,
})

/**
 * Add any application specific helpers here, you can find some
 * packaged helpers in https://github.com/KTH/kth-node-web-common/tree/master/lib/handlebars/helpers
 * Those only need to be required. Docs embedded in source.
 */
registerBreadcrumbHelper()
registerLanguageLinkHelper()
registerConditionalLogotypeSrcHelper()

const i18n = require('../../../i18n')
require('@kth/kth-node-web-common/lib/handlebars/helpers/createI18nHelper')(i18n)
