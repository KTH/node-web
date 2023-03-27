'use strict'

/**
 * System controller for functions such as /about and /monitor
 */
const os = require('os')

const errorHandler = require('@kth/kth-node-web-common/lib/error')
const { getPaths } = require('kth-node-express-routing')
const language = require('@kth/kth-node-web-common/lib/language')
const monitorSystems = require('@kth/monitor')
const log = require('@kth/log')
const redis = require('kth-node-redis')
const version = require('../../config/version')
const i18n = require('../../i18n')
const packageFile = require('../../package.json')

const api = require('../api')
const { server: config } = require('../configuration')

/**
 * Adds a zero (0) to numbers less then ten (10)
 */
function zeroPad(value) {
  return value < 10 ? '0' + value : value
}

/**
 * Takes a Date object and returns a simple date string.
 */
function _simpleDate(date) {
  const year = date.getFullYear()
  const month = zeroPad(date.getMonth() + 1)
  const day = zeroPad(date.getDate())
  const hours = zeroPad(date.getHours())
  const minutes = zeroPad(date.getMinutes())
  const seconds = zeroPad(date.getSeconds())
  const hoursBeforeGMT = date.getTimezoneOffset() / -60
  const timezone = [' GMT', ' CET', ' CEST'][hoursBeforeGMT] || ''
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${timezone}`
}

const started = _simpleDate(new Date())

/**
 * Get request on not found (404)
 * Renders the view 'notFound' with the layout 'exampleLayout'.
 */
function _notFound(req, res, next) {
  const err = new Error('Not Found: ' + req.originalUrl)
  err.status = 404
  next(err)
}

// this function must keep this signature for it to work properly
// eslint-disable-next-line no-unused-vars
function _final(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500
  const isProd = /prod/gi.test(process.env.NODE_ENV)
  const lang = language.getLanguage(res)

  // Use error pages from @kth/kth-node-web-common based on given parameters.
  errorHandler.renderErrorPage(res, req, statusCode, i18n, isProd, lang, err)
}

/**
 * GET /_about
 * About page
 */
async function getAbout(req, res) {
  const paths = getPaths()
  const aboutData = {
    appName: packageFile.name,
    appVersion: packageFile.version,
    appDescription: packageFile.description,
    monitorUri: paths.system.monitor.uri,
    robotsUri: paths.system.robots.uri,
    gitBranch: JSON.stringify(version.gitBranch),
    gitCommit: JSON.stringify(version.gitCommit),
    jenkinsBuild: JSON.stringify(version.jenkinsBuild),
    jenkinsBuildDate: version.jenkinsBuild
      ? _simpleDate(new Date(parseInt(version.jenkinsBuild, 10) * 1000))
      : JSON.stringify(version.jenkinsBuildDate),
    dockerName: JSON.stringify(version.dockerName),
    dockerVersion: JSON.stringify(version.dockerVersion),
    hostname: os.hostname(),
    started,
    env: process.env.NODE_ENV,
  }
  if (req.headers.accept === 'application/json') {
    return res.json(aboutData)
  }
  return res.render('system/about', {
    layout: 'systemLayout',
    ...aboutData,
  })
}

/* GET /_monitor
 * Monitor page
 */
async function _monitor(req, res) {
  console.log('🌐 Monitor in Node Web:', { hostname: req.hostname })
  try {
    const apiConfig = config.nodeApi
    await monitorSystems(req, res, [
      ...(api
        ? Object.keys(api).map(apiKey => ({
            key: apiKey,
            required: apiConfig[apiKey].required,
            endpoint: api[apiKey],
          }))
        : []),
      {
        key: 'redis',
        required: true,
        redis,
        options: config.session.redisOptions,
      },
      // If we need local system checks, such as memory or disk, we would add it here.
      // Make sure it returns an object containing:
      // {key: 'local', isResolved: true, statusCode: ###, message: '...'}
      // The property statusCode should be standard HTTP status codes.
      {
        key: 'local',
        isResolved: true,
        message: '- local system checks: OK',
        statusCode: 200,
      },
      {
        key: 'azure',
        isResolved: true,
        message: req.hostname?.includes('azurewebsites')
          ? '- I am running in an App service!'
          : '- Where am I running?',
        statusCode: 200,
      },
    ])
  } catch (error) {
    log.error('Monitor failed', error)
    res.status(500).end()
  }
}

/* GET /robots.txt
 * Robots.txt page
 */
function _robotsTxt(req, res) {
  res.type('text').render('system/robots')
}

/* GET /_paths
 * Return all paths for the system
 */
function _paths(req, res) {
  res.json(getPaths())
}
/**
 * GET /_status
 * Status - dynamic status information about the application.
 */
async function getStatus(req, res) {
  const statusData = {
    appName: packageFile.name,
    appVersion: packageFile.version,
    hostname: os.hostname(),
    started,
    env: process.env.NODE_ENV,
  }
  if (req.headers.accept === 'application/json') {
    return res.json(statusData)
  }
  return res.send(JSON.stringify(statusData))
}
/*
 * ----------------------------------------------------------------
 * Publicly exported functions.
 * ----------------------------------------------------------------
 */

module.exports = {
  monitor: _monitor,
  about: getAbout,
  robotsTxt: _robotsTxt,
  paths: _paths,
  notFound: _notFound,
  final: _final,
  status: getStatus,
}
