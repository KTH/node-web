import React from 'react'

function MainMenu({ parentItem = {}, menuItems = [] }) {
  return (
    <nav id="mainMenu" className="kth-local-navigation" aria-label="Sub menu">
      <a className="kth-button back" href={parentItem.url}>
        {parentItem.label}
      </a>
      {menuItems.map(menuItem =>
        Array.isArray(menuItem) ? (
          <ul key="nav-list">
            {menuItem.map(({ type, url, label }) => (
              <li key={`${type}-${label}`}>
                <a className={type == 'node' ? 'expandable' : ''} href={url}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <h2 key="nav-ancestor">{menuItem.label}</h2>
        )
      )}
    </nav>
  )
}

export default MainMenu
