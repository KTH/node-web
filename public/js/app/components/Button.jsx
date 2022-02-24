import React, { useState } from 'react'

import i18n from '../../../../i18n'

function Button({ caption = 'N/A', lang = 'sv' }) {
  const [buttonClicked, setButtonClicked] = useState(false)

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setButtonClicked(true)}>
        {caption}
      </button>
      {buttonClicked ? <p>{i18n.message('template_button_works', lang)}</p> : null}
    </>
  )
}

export default Button
