import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useState } from 'react'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [overlayIsShowing, SetOverlayIsShowing] = useState<boolean>(false)

  const showOverlay = (): void => {
    window.electron.ipcRenderer.send('toggle-overlay', !overlayIsShowing)
    SetOverlayIsShowing(!overlayIsShowing)
  }

  const handleStartRecording = (): void => {
    window.api.startStreaming()
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <button type="button" onClick={showOverlay}>Mostrar Overlay</button>
        <button type="button" onClick={handleStartRecording}>Record</button>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
