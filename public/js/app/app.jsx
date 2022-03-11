/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom'

import { WebContextProvider } from './context/WebContext'
import { uncompressData } from './context/compress'
import { AdminContextProvider } from './context/AdminContext'
import '../../css/node-web.scss'

import Start from './pages/Start'

import AdminStart from './pages/AdminStart'

export default appFactory

_renderOnClientSide()

function _renderOnClientSide() {
  const isClientSide = typeof window !== 'undefined'
  if (!isClientSide) {
    return
  }

  const webContext = {}
  uncompressData(webContext)

  const adminContext = {}
  uncompressData(adminContext, 'admin')

  const basename = webContext.proxyPrefixPath.uri

  const app = <BrowserRouter basename={basename}>{appFactory({}, webContext, adminContext)}</BrowserRouter>

  const domElement = document.getElementById('app')
  ReactDOM.hydrate(app, domElement)
}

function SimplePage({ heading }) {
  return (
    <>
      <Link to="/">Tillbaka</Link>
      <h1>{heading}</h1>
    </>
  )
}

function appFactory(applicationStore, context, adminContext) {
  return (
    <WebContextProvider configIn={context}>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/secure" element={<SimplePage heading="Secure page" />} />
        <Route path="/silent" element={<SimplePage heading="Silent page" />} />
        <Route
          path="/_admin"
          element={
            <AdminContextProvider configIn={adminContext}>
              <AdminStart />
            </AdminContextProvider>
          }
        />
        <Route path="*" element={<SimplePage heading="Not found" />} />
      </Routes>
    </WebContextProvider>
  )
}
