import React, { useState } from 'react'

import i18n from '../../../../i18n'

import { useWebContext } from '../context/WebContext'
import { useAdminContext } from '../context/AdminContext'

import MainContent from '../components/MainContent'
import Alert from '../components/Alert'

const AdminStart = () => {
  const [webContext] = useWebContext()
  const { message, lang } = webContext

  const [adminContext] = useAdminContext()
  const { adminData = {} } = adminContext

  const initAlertConfig = {
    type: 'info',
    rawMessage: `Message in WebContext: ${message} – Data in AdminContext: (x: ${adminData.x}, y: ${adminData.y})`,
    timeout: 5000,
    lang,
  }
  const [alertConfig, setAlertConfig] = useState(initAlertConfig)

  return (
    <>
      <nav id="mainMenu" className="col navbar navbar-expand-lg navbar-light sticky-menu" aria-label="Sub menu">
        <a href="/node/secure">{i18n.message('template_secured_page_heading', lang)}</a>
        <br />
        <a href="/node/silent">{i18n.message('template_silent_login_page_heading', lang)}</a>
        <br />
        <a href="/node/">{i18n.message('template_back_link', lang)}</a>
      </nav>
      <MainContent>
        <h1>Node-web Admin page</h1>
        <h2>{i18n.message('template_app_works', lang)}</h2>
        <Alert config={alertConfig} setConfig={setAlertConfig} />
      </MainContent>
    </>
  )
}

export default AdminStart
