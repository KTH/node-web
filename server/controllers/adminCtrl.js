/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const log = require('@kth/log')
const language = require('@kth/kth-node-web-common/lib/language')

// eslint-disable-next-line no-unused-vars
const api = require('../api')
const serverConfig = require('../configuration').server

const { getServerSideFunctions } = require('../utils/serverSideRendering')

async function getAdminIndex(req, res, next) {
  try {
    const lang = language.getLanguage(res)
    const { user } = req

    const { getCompressedData, renderStaticPage } = getServerSideFunctions()

    const webContext = {
      isAdmin: user ? user.isAdmin : false,
      proxyPrefixPath: serverConfig.proxyPrefixPath,
      lang,
      message: 'Howdi from Admin controller',
      apiHost: serverConfig.hostUrl,
    }

    const compressedData = getCompressedData(webContext)
    const adminContext = {
      adminData: { x: 10, y: 20 },
    }
    const compressedAdminData = getCompressedData(adminContext, 'admin')
    const { uri: proxyPrefix } = serverConfig.proxyPrefixPath

    const view = renderStaticPage({
      applicationStore: {},
      location: req.url,
      basename: proxyPrefix,
      context: webContext,
      adminContext,
    })
    log.info(`node_web: toolbarUrl: ${serverConfig.toolbar.url}`)

    const breadcrumbsList = [
      { label: 'KTH', url: serverConfig.hostUrl },
      { label: 'Node', url: serverConfig.hostUrl },
    ]

    res.render('sample/admin', {
      html: view,
      title: 'Admin',
      compressedData,
      compressedAdminData,
      description: 'Admin',
      breadcrumbsList,
      lang,
      proxyPrefix,
      toolbarUrl: serverConfig.toolbar.url,
      theme: 'intranet',
      translationLinkMessageKey: 'language_link_translation_link',
      translationLink: `https://kth.se${lang === 'sv' ? '?l=en' : '?l=sv'}`,
      translationDialogMessageKey: 'language_link_translation_dialog',
    })
  } catch (err) {
    log.error('Error in getAdminIndex', { error: err })
    next(err)
  }
}

module.exports = {
  getAdminIndex,
}
