import React from 'react'

import i18n from '../../../../i18n'

import { useWebContext } from '../context/WebContext'

import MainContent from '../components/MainContent'

const SimplePage = ({ headingId }) => {
  const [webContext] = useWebContext()
  const { lang } = webContext
  return (
    <>
      <nav id="mainMenu" className="col navbar navbar-expand-lg navbar-light sticky-menu" aria-label="Sub menu">
        <a href="/node/">{i18n.message('template_back_link', lang)}</a>
      </nav>
      <MainContent>
        <h1>{i18n.message(headingId, lang)}</h1>
      </MainContent>
    </>
  )
}

export default SimplePage
