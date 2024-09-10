import React from 'react'

import i18n from '../../../../i18n'

import { useWebContext } from '../context/WebContext'

import MainMenu from '../components/MainMenu'
import MobileMenu from '../components/MobileMenu'
import MainContent from '../components/MainContent'
import Button from '../components/Button'

function Start() {
  const [webContext, setContext] = useWebContext()
  const { mainMenu, message, lang, count = 0 } = webContext
  const { ancestor, menuItems, parentItem } = mainMenu

  const incrementCount = () => {
    const newVal = { count: count + 1 }
    setContext({ ...webContext, ...newVal })
  }

  return (
    <>
      <MobileMenu ancestor={ancestor} />
      <MainMenu ancestor={ancestor} parentItem={parentItem} menuItems={menuItems} />
      <MainContent>
        <h1>Node-web</h1>
        <h2>{i18n.message('template_app_works', lang)}</h2>
        <hr />
        <p>{`${i18n.message('template_store_text', lang)}: ${message}`}</p>
        <Button caption={i18n.message('template_try_me', lang)} lang={lang} />
        <hr />
        <Button
          caption={`${i18n.message('template_button_increment', lang)} ${count}`}
          lang={lang}
          onClick={incrementCount}
        />
      </MainContent>
    </>
  )
}

export default Start
