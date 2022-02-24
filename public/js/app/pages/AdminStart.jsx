import React from 'react'

import { useWebContext } from '../context/WebContext'

import i18n from '../../../../i18n'

import Button from '../components/Button'

const AdminStart = () => {
  const [webContext] = useWebContext()
  const { message, lang } = webContext

  return (
    <main id="mainContent">
      <h1>Node-web Admin page</h1>
      <h2>{i18n.message('template_app_works', lang)}</h2>
      <hr className="my-2" />
      <p>{`${i18n.message('template_store_text', lang)}: ${message}`}</p>
      <Button caption={i18n.message('template_try_me', lang)} />
      <hr />
      <div>
        <a href="/node/secure">Secured page</a>
        <br />
        <a href="/node/_admin">Secured page for admins</a>
        <br />
        <a href="/node/silent">Silent login page</a>
      </div>
    </main>
  )
}

export default AdminStart
