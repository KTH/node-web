import React from 'react'

function MainContent({ children }) {
  return (
    <main id="mainContent" className="container-fluid">
      {children}
    </main>
  )
}

export default MainContent
