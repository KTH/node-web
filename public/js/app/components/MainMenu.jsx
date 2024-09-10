import React from 'react'

function MainMenu({ ancestor, parentItem, menuItems }) {
  return (
    <nav id="mainMenu" className="kth-local-navigation" aria-label="Sub menu">
      <a className="kth-button back" href={parentItem.url}>
        {parentItem.label}
      </a>
      <h2 key="nav-ancestor">{ancestor}</h2>
      <ul key="nav-list">
        {menuItems.map(({ type, url, label }) => (
          <li key={`${type}-${label}`}>
            <a className={type == 'node' ? 'expandable' : ''} href={url}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default MainMenu
