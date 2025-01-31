/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const log = require('@kth/log')
const language = require('@kth/kth-node-web-common/lib/language')
const typeset = require('typeset')

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

    const unprocessedHtml = `
      <h3>Åker ordningens och, vad.</h3>
      <p>”Löksås ipsum för räv denna dunge trevnadens gamla dimmhöljd lax ska, groda det där att blev sjö hav blivit som, tid rot så blivit del rännil hav mot häst. Tre att björnbär händer färdväg så rot precis, vad plats händer hans genom tidigare nya mjuka, redan fram göras sig vemod händer. Och helt flera som därmed kanske redan enligt gör redan, träutensilierna hela kan för ordningens äng annat samtidigt, flera enligt hwila det som stora denna sig.”</p>
      <p>Sorgliga del hwila flera både miljoner har gamla vid nya, tid sitt plats dock hav dock vad. Sista där dock göras fram ordningens dimma rot att, själv rännil sorgliga plats annat blev annan färdväg, räv smultron vad brunsås precis kom nu. Ser vid samtidigt upprätthållande kanske vad faktor som blev del, händer icke redan räv sjö vidsträckt därmed och, vidsträckt göras redan kan ser har flera söka.</p>
    `
    const processedHtml = typeset(unprocessedHtml)

    const webContext = {
      isAdmin: user ? user.isAdmin : false,
      proxyPrefixPath,
      lang,
      message: 'Howdi from Sample controller',
      apiHost: hostUrl,
      mainMenu,
      unprocessedHtml,
      processedHtml,
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
