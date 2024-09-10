import React from 'react'

import i18n from '../../../../i18n'

function MobileMenu({ lang, ancestor }) {
  return (
    <nav className="kth-local-navigation--mobile" aria-labelledby="kth-local-navigation-title--mobile">
      <button className="kth-button menu" id="kth-local-navigation-title--mobile">
        <span>{ancestor}</span>
      </button>
      <dialog className="kth-mobile-menu left">
        <div className="kth-mobile-menu__navigation">
          <button className="kth-icon-button close">
            <span className="kth-visually-hidden">{i18n.message('main_menu_button_close', lang)}</span>
          </button>
        </div>
        <div className="mobile-menu__content">
          <ul id="mobileMenuList" className="menu navbar-nav" />
        </div>
      </dialog>
    </nav>
  )
}

export default MobileMenu
