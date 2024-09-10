/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const log = require('@kth/log')
const language = require('@kth/kth-node-web-common/lib/language')

const i18n = require('../../i18n')
const serverConfig = require('../configuration').server

const { getServerSideFunctions } = require('../utils/serverSideRendering')

async function getIndex(req, res, next) {
  try {
    const lang = language.getLanguage(res)
    const { user } = req

    const { getCompressedData, renderStaticPage } = getServerSideFunctions()

    const { proxyPrefixPath, hostUrl } = serverConfig
    const { uri: proxyPrefix } = proxyPrefixPath

    const mainMenu = {
      ancestor: i18n.message('site_name', lang),
      menuItems: [
        {
          type: 'leaf',
          url: `${proxyPrefix}/secure`,
          label: i18n.message('template_secured_page_heading', lang),
        },
        {
          type: 'leaf',
          url: `${proxyPrefix}/_admin`,
          label: i18n.message('template_secured_admin_page_heading', lang),
        },
        {
          type: 'leaf',
          url: `${proxyPrefix}/silent`,
          label: i18n.message('template_silent_login_page_heading', lang),
        },
      ],
      parentItem: {
        url: hostUrl,
        label: i18n.message('host_name', lang),
      },
    }

    const webContext = {
      isAdmin: user ? user.isAdmin : false,
      proxyPrefixPath,
      lang,
      message: 'Howdi from Sample controller',
      apiHost: hostUrl,
      mainMenu,
    }

    const compressedData = getCompressedData(webContext)

    const view = renderStaticPage({
      applicationStore: {},
      location: req.url,
      basename: proxyPrefix,
      context: webContext,
    })
    log.info(`node_web: toolbarUrl: ${serverConfig.toolbar.url}`)

    const breadcrumbsList = [
      { label: 'KTH', url: serverConfig.hostUrl },
      { label: 'Node', url: serverConfig.hostUrl },
    ]

    res.render('sample/index', {
      html: view,
      title: 'Sample',
      compressedData,
      description: 'Sample',
      breadcrumbsList,
      lang,
      proxyPrefix,
      toolbarUrl: serverConfig.toolbar.url,
      theme: 'external',
    })
  } catch (err) {
    log.error('Error in getIndex', { error: err })
    next(err)
  }
}

module.exports = {
  getIndex,
}
