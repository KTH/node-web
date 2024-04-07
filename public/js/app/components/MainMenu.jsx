import React from 'react'

function ParentItem({ url, label }) {
  return (
    <ul className="nav">
      <li className="parentLink">
        <a href={url}>{label}</a>
      </li>
    </ul>
  )
}

function NavAncestor({ label }) {
  return (
    <ul className="nav nav-ancestor">
      <li>
        <span className="nav-item ancestor">{label}</span>
      </li>
    </ul>
  )
}

function NavItem({ type, url, label }) {
  // type is 'leaf' or 'node'
  return (
    <li className={`nav-item ${type}`}>
      <a className="nav-link" href={url}>
        {label}
      </a>
    </li>
  )
}

function NavList({ navItems }) {
  return (
    <ul className="nav nav-list">
      {navItems.map(({ type, url, label }) => (
        <NavItem key={`${type}-${label}`} type={type} url={url} label={label} />
      ))}
    </ul>
  )
}

function MainMenu({ parentItem = {}, menuItems = [] }) {
  return (
    <nav id="mainMenu" className="col navbar navbar-expand-lg navbar-light" aria-label="Sub menu">
      <div className="collapse navbar-collapse" id="navbarNav">
        <ParentItem url={parentItem.url} label={parentItem.label} />
        {menuItems.map(menuItem =>
          Array.isArray(menuItem) ? (
            <NavList key="nav-list" navItems={menuItem} />
          ) : (
            <NavAncestor key="nav-ancestor" label={menuItem.label} />
          )
        )}
      </div>
    </nav>
  )
}

export default MainMenu
