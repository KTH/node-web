import React from 'react'

const WebContext = React.createContext()
const defaultConfig = {
  language: 'sv',
  isAdmin: false,
  basicBreadcrumbs: [
    { label: 'KTH', url: 'https://kth.se' },
    { label: 'Cortina-calendar', url: 'https://kth.se/cortina-calendar' },
  ],
  proxyPrefixPath: { uri: 'cortina-calendar' },
  message: 'howdi',
  cmUrl: 'http://www.kth.se/om/mot/kalender',
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
  return <WebContext.Provider value={value} {...props} />
}

export function useWebContext() {
  const context = React.useContext(WebContext)
  if (!context) {
    return [({}, () => {})]
  }
  return context
}
