/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import { MobxStoreProvider, uncompressStoreInPlaceFromDocument } from './mobx'
import createApplicationStore from './stores/createApplicationStore'

import '../../css/node-web.scss'

import Start from './pages/Start'

export default appFactory

_renderOnClientSide()

function _renderOnClientSide() {
  const isClientSide = typeof window !== 'undefined'
  if (!isClientSide) {
    return
  }

  // @ts-ignore
  const basename = window.config.proxyPrefixPath.uri

  const applicationStore = createApplicationStore()
  uncompressStoreInPlaceFromDocument(applicationStore)

  const app = <BrowserRouter basename={basename}>{appFactory(applicationStore)}</BrowserRouter>

  const domElement = document.getElementById('app')
  ReactDOM.hydrate(app, domElement)
}

function appFactory(applicationStore) {
  return (
    <MobxStoreProvider initCallback={() => applicationStore}>
      <Switch>
        <Route exact path="/" component={Start} />
        <Route exact path="/secure">
          <a href="/node/">Tillbaka</a>
          <h1>Secured page</h1>
        </Route>
        <Route exact path="/secure/admin">
          <a href="/node/">Tillbaka</a>
          <h1>Secured Admin page</h1>
        </Route>
        <Route exact path="/silent">
          <a href="/node/">Tillbaka</a>
          <h1>Silent page</h1>
        </Route>
      </Switch>
    </MobxStoreProvider>
  )
}
