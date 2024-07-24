import React, { useState } from 'react'
import { Button as KthButton } from '@kth/ui-components'

import i18n from '../../../../i18n'

function Button({ caption = 'N/A', lang = 'sv', onClick = null }) {
  const [buttonClicked, setButtonClicked] = useState(false)
  const doClick = onClick || setButtonClicked
  return (
    <>
      <KthButton variant="success" onClick={() => doClick(true)}>
        {caption}
      </KthButton>
      {buttonClicked ? <p>{i18n.message('template_button_works', lang)}</p> : null}
    </>
  )
}

export default Button
