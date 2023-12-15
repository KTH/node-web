/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const { readFileSync } = require('fs')
const path = require('path')

const React = require('react')
const { renderToPipeableStream } = require('react-server-dom-webpack/server')

const log = require('@kth/log')
// const language = require('@kth/kth-node-web-common/lib/language')

// eslint-disable-next-line no-unused-vars
const api = require('../api')
// const serverConfig = require('../configuration').server

// const { getServerSideFunctions } = require('../utils/serverSideRendering')
const App = require('../components/App.js')

async function getIndex(req, res, next) {
  try {
    // const lang = language.getLanguage(res)
    // const proxyPrefix = serverConfig.proxyPrefixPath
    // const { user } = req
    // const { getCompressedData, renderStaticPage } = getServerSideFunctions()
    // const webContext = {
    //   isAdmin: user ? user.isAdmin : false,
    //   proxyPrefixPath: serverConfig.proxyPrefixPath,
    //   lang,
    //   message: 'Howdi from Sample controller',
    //   apiHost: serverConfig.hostUrl,
    // }
    // const compressedData = getCompressedData(webContext)
    // const { uri: proxyPrefix } = serverConfig.proxyPrefixPath
    // const view = renderStaticPage({
    //   applicationStore: {},
    //   location: req.url,
    //   basename: proxyPrefix,
    //   context: webContext,
    // })
    // log.info(`node_web: toolbarUrl: ${serverConfig.toolbar.url}`)
    // const breadcrumbsList = [
    //   { label: 'KTH', url: serverConfig.hostUrl },
    //   { label: 'Node', url: serverConfig.hostUrl },
    // ]
    // res.render('sample/index', {
    //   html: `Hello RSC World!`,
    //   title: 'Hello RSC World!',
    //   description: 'Hello RSC World!',
    //   breadcrumbsList,
    //   lang,
    //   proxyPrefix,
    //   toolbarUrl: serverConfig.toolbar.url,
    // })

    const props = {}

    const manifest = readFileSync(path.resolve(__dirname, '../../dist/react-client-manifest.json'), 'utf8')
    const moduleMap = JSON.parse(manifest)
    const { pipe } = renderToPipeableStream(React.createElement(App, props), moduleMap)
    pipe(res)
  } catch (err) {
    log.error('Error in getIndex', { error: err })
    next(err)
  }
}

module.exports = {
  getIndex,
}
