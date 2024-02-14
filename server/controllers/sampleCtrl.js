/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const log = require('@kth/log')
const language = require('@kth/kth-node-web-common/lib/language')

// eslint-disable-next-line no-unused-vars
const api = require('../api')
const serverConfig = require('../configuration').server

const { getServerSideFunctions } = require('../utils/serverSideRendering')

async function getIndex(req, res, next) {
  console.log('IN CON<tROLLER')
  console.log('Blocks', res.locals.blocks)

  try {
    const lang = language.getLanguage(res)
    const { user } = req

    const { getCompressedData, renderStaticPage } = getServerSideFunctions()

    const webContext = {
      isAdmin: user ? user.isAdmin : false,
      proxyPrefixPath: serverConfig.proxyPrefixPath,
      lang,
      message: 'Howdi from Sample controller',
      apiHost: serverConfig.hostUrl,
    }

    const compressedData = getCompressedData(webContext)
    const { uri: proxyPrefix } = serverConfig.proxyPrefixPath

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
    })
  } catch (err) {
    log.error('Error in getIndex', { error: err })
    next(err)
  }
}

module.exports = {
  getIndex,
}
