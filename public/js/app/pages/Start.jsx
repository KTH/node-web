import React from 'react'

import { useWebContext } from '../context/WebContext'

import MainMenu from '../components/MainMenu'
import MobileMenu from '../components/MobileMenu'
import MainContent from '../components/MainContent'

function Start() {
  const [webContext] = useWebContext()
  const { mainMenu, unprocessedHtml, processedHtml } = webContext
  const { ancestor, menuItems, parentItem } = mainMenu

  return (
    <>
      <MobileMenu ancestor={ancestor} />
      <MainMenu ancestor={ancestor} parentItem={parentItem} menuItems={menuItems} />
      <MainContent>
        <h1>Löksås ipsum</h1>
        <h2>Utan pre-processor</h2>
        <p dangerouslySetInnerHTML={{ __html: unprocessedHtml }}></p>
        <h2>Med pre-processor</h2>
        <p dangerouslySetInnerHTML={{ __html: processedHtml }}></p>
        <p></p>
      </MainContent>
    </>
  )
}

export default Start
