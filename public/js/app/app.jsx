/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

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

function appFactory(applicationStore, context, adminContext) {
  return (
    <WebContextProvider configIn={context}>
      <Switch>
        <Route exact path="/" component={Start} />
        <Route exact path="/secure">
          <a href="/node/">Tillbaka</a>
          <h1>Secured page</h1>
        </Route>
        <Route exact path="/silent">
          <a href="/node/">Tillbaka</a>
          <h1>Silent page</h1>
        </Route>
        <AdminContextProvider configIn={adminContext}>
          <Route exact path="/_admin" component={AdminStart} />
        </AdminContextProvider>
      </Switch>
    </WebContextProvider>
  )
}
