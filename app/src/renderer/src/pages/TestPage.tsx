import { useEffect, useState } from 'react'

const TestPage: React.FC = () => {
  //   const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [overlayIsShowing, SetOverlayIsShowing] = useState<boolean>(false)
  const [transcription, setTranscription] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const showOverlay = (): void => {
    window.electron.ipcRenderer.send('toggle-overlay', !overlayIsShowing)
    SetOverlayIsShowing(!overlayIsShowing)
  }

  const handleStartRecording = async (): Promise<void> => {
    try {
      // Iniciar la grabación
     console.log("resposos222")
     const response = await window.api.startStreaming('speaker')
     console.log("resposos", response)
    } catch (err) {
      // console.log(err)
    }
  }
  const handleGetDevices = async (): Promise<void> => {
    const response = await window.api.getAudioDevices('mic')

    if (response.success) {
      console.log('Dispositivos de audio:', response.devices)
    } else {
      console.error('Error al obtener dispositivos:', response.error)
    }
  }
  useEffect(() => {
    // Escuchar eventos de transcripción en tiempo real
    const handleStreamingData = (event: any, data: string) => {
      setTranscription((prev) => prev + data) // Agregar la nueva transcripción
      console.log("dasdas", data)
    }

    const handleStreamingError = (event: any, data: string) => {
      setError(data) // Manejar errores
      console.log("dasdas3232", data)
    }

    window.api.on('streaming-data', handleStreamingData)
    window.api.on('streaming-error', handleStreamingError)

    return () => {
      // Limpiar los eventos cuando el componente se desmonte
      window.api.removeListener('streaming-data', handleStreamingData)
      window.api.removeListener('streaming-error', handleStreamingError)
    }
  }, [])
  return (
    <div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        {/* <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div> */}
        <button type="button" onClick={showOverlay}>
          Mostrar Overlay
        </button>
        <button type="button" onClick={handleStartRecording}>
          Record
        </button>
        <button type="button" onClick={handleGetDevices}>
          devices
        </button>
      </div>
    </div>
  )
}

export default TestPage
