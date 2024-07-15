import React, { useEffect } from 'react'
import i18n from '../../../../i18n'

const Alert = ({ config, setConfig }) => {
  const { type, message, timeout = 30000, lang, rawMessage } = config || {}

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => {
        setConfig(null)
      }, timeout)
      return () => clearTimeout(timer)
    }
    return () => {}
  })

  const alertMessage = rawMessage ?? i18n.message(message, lang)
  if (!config) {
    return null
  }
  return (
    <div className={'kth-alert ' + type} role="alert">
      {alertMessage}
    </div>
  )
}
export default Alert
