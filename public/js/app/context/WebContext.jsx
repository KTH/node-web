import React from 'react'

const WebContext = React.createContext()
const defaultConfig = {
  lang: 'sv',
  isAdmin: false,
  proxyPrefixPath: { uri: 'node' },
  message: 'Howdi',
}

export const WebContextProvider = props => {
  const { configIn = {} } = props
  const config = { ...defaultConfig }
  for (const k in configIn) {
    if (Object.prototype.hasOwnProperty.call(configIn, k)) {
      if (typeof configIn[k] === 'object') {
        config[k] = JSON.parse(JSON.stringify(configIn[k]))
      } else {
        config[k] = configIn[k]
      }
    }
  }

  const [currentConfig, setConfig] = React.useState(config)
  const value = [currentConfig, setConfig]
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <WebContext value={value} {...props} />
}

export function useWebContext() {
  const context = React.useContext(WebContext)
  if (!context) {
    throw new Error('useWebContext must be used within a WebContext')
  }
  return context
}
