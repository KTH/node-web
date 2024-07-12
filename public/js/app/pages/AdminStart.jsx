import React, { useState, useActionState } from 'react'

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

  const postData = async () => null // ({ message: 'Äsch' })

  const [error, submitAction, isPending] = useActionState(async (previousState, formData) => {
    const postDataError = await postData(formData.get('id'), formData.get('name'))
    if (postDataError) {
      setAlertConfig({ type: 'warning', rawMessage: error.message })
      return
    }
    setAlertConfig({
      type: 'info',
      rawMessage: `Successfully updated name with ${formData.get('id')} and ${formData.get('name')}`,
    })
  }, null)

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
        <h1>{i18n.message('heading_admin_page', lang)}</h1>
        <h2>{i18n.message('template_app_works', lang)}</h2>
        <Alert config={alertConfig} setConfig={setAlertConfig} />
        <form action={submitAction}>
          <h3>{i18n.message('heading_add_new_user', lang)}</h3>
          <div className="form-group">
            <label className="form-control-label" htmlFor="id">
              {i18n.message('field_label_id', lang)}
            </label>
            <input type="text" className="form-control" name="id" />
          </div>
          <div className="form-group">
            <label className="form-control-label" htmlFor="name">
              {i18n.message('field_label_name', lang)}
            </label>
            <input type="text" className="form-control" name="name" />
          </div>
          <div className="form-group">
            <button type="submit" className="kth-button primary" disabled={isPending}>
              {i18n.message('button_label_add', lang)}
            </button>
          </div>
        </form>
      </MainContent>
    </>
  )
}

export default AdminStart
