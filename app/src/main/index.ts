import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import path, { join } from 'path'
import dotenv from 'dotenv'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'

dotenv.config()

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 350,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  const trayIcon =
    process.platform === 'darwin' ? icon : join(__dirname, '../../resources/icon.png')
  tray = new Tray(trayIcon)
  tray.setToolTip('FreeLang')
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Open App',
      click: (): void => {
        mainWindow?.show()
      }
    },
    {
      label: 'Quit',
      click: (): void => {
        app.quit()
      }
    }
  ])
  tray.setContextMenu(trayMenu)

  tray.on('click', () => {
    mainWindow?.show()
  })
}

function createOverlay(): void {
  if (!overlayWindow) {
    overlayWindow = new BrowserWindow({
      width: 400,
      height: 150,
      x: 100,
      y: 100,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        preload: join(__dirname, '../preload/index.js')
      }
    })

    overlayWindow.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(`
          <html>
            <body style="margin: 0; padding: 0; background: transparent; 
                        color: white; font-size: 36px; font-weight: bold; 
                        text-align: center; border: 5px solid yellow; 
                        border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
              Texto del Overlay
            </body>
          </html>
        `)
    )
  }
}

ipcMain.on('toggle-overlay', (_event, shouldShow: boolean) => {
  if (shouldShow) {
    if (!overlayWindow) {
      createOverlay()
    }
    overlayWindow?.show()
  } else {
    if (overlayWindow) {
      overlayWindow.close()
      overlayWindow = null
    }
  }
})

ipcMain.handle(
  'voicemeeter-api-calls',
  async (event, queryType: 'isRunning' | 'open' | 'close') => {
    return new Promise((resolve) => {
      const vcStatusPath = 'getVoicemeeterStatus.py'
      const vcRunOrClosePath = 'openOrCloseVoicemeeter.py'
      const scriptPath = path.resolve(
        __dirname,
        `../../src/main/backend/utils/voicemeeterApi/${queryType === 'open' || queryType === 'close' ? vcRunOrClosePath : vcStatusPath}`
      )
      const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

      const pythonProcess = spawn(venvPython, ['-u', scriptPath, queryType])

      let outputData = ''

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data.toString().trim()}`)
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const response = JSON.parse(outputData.trim())
            resolve(response)
          } catch (error) {
            console.error(`Error parsing JSON output: ${error.message}`)
            resolve({
              success: false,
              error: `Error parsing JSON output: ${error.message}`
            })
          }
        } else {
          resolve({
            success: false,
            error: `Error executing Python script. Code: ${code}`
          })
        }
      })
    })
  }
)
ipcMain.handle('get_VC_settings_status', async (event) => {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(
      __dirname,
      `../../src/main/backend/utils/voicemeeterApi/getVCSettingsStatus.py`
    )
    const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

    const pythonProcess = spawn(venvPython, ['-u', scriptPath])

    let outputData = ''

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script error: ${data.toString().trim()}`)
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(outputData.trim())
          resolve(response)
        } catch (error) {
          console.error(`Error parsing JSON output: ${error.message}`)
          resolve({
            success: false,
            error: `Error parsing JSON output: ${error.message}`
          })
        }
      } else {
        resolve({
          success: false,
          error: `Error executing Python script. Code: ${code}`
        })
      }
    })
  })
})

ipcMain.handle('set_VC_setup', async (event, device_name: string) => {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(
      __dirname,
      `../../src/main/backend/utils/voicemeeterApi/setVCSetup.py`
    )
    const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

    const pythonProcess = spawn(venvPython, ['-u', scriptPath, device_name])

    let outputData = ''

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script error: ${data.toString().trim()}`)
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(outputData.trim())
          resolve(response)
        } catch (error) {
          console.error(`Error parsing JSON output: ${error.message}`)
          resolve({
            success: false,
            error: `Error parsing JSON output: ${error.message}`
          })
        }
      } else {
        resolve({
          success: false,
          error: `Error executing Python script. Code: ${code}`
        })
      }
    })
  })
})

ipcMain.handle('find_default_audio_device', async (event) => {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(
      __dirname,
      '../../src/main/backend/utils/getUserDefaultAudioDevice.py'
    )
    const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

    const pythonProcess = spawn(venvPython, ['-u', scriptPath])

    let outputData = ''

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error parsing JSON output: ${data.toString().trim()}`)
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(outputData.trim())
          resolve(response)
        } catch (error) {
          console.error(`Error parsing JSON output: ${error.message}`)
          resolve({
            success: false,
            error: `Error parsing JSON output: ${error.message}`
          })
        }
      } else {
        resolve({
          success: false,
          error: `Error executing Python script. Code: ${code}`
        })
      }
    })
  })
})

ipcMain.handle('find-audio-devices', async (event) => {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(
      __dirname,
      '../../src/main/backend/utils/getUserAudioDevices.py'
    )
    const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

    const pythonProcess = spawn(venvPython, ['-u', scriptPath])

    let outputData = ''

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error parsing JSON output: ${data.toString().trim()}`)
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(outputData.trim())
          resolve(response)
        } catch (error) {
          console.error(`Error parsing JSON output: ${error.message}`)
          resolve({
            success: false,
            error: `Error parsing JSON output: ${error.message}`
          })
        }
      } else {
        resolve({
          success: false,
          error: `Error executing Python script. Code: ${code}`
        })
      }
    })
  })
})

ipcMain.handle('start-streaming', async (event, device) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../../src/main/backend/utils/speechToTextPy.py')
    const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

    const pythonProcess = spawn(venvPython, ['-u', scriptPath, device])

    let outputData = ''

    pythonProcess.stdout.on('data', (data) => {
      const receivedData = data.toString().trim()
      outputData += receivedData

      try {
        const response = JSON.parse(receivedData)
        if (response.success) {
          event.sender.send('streaming-data', response.data)
        } else {
          throw Error(response.error)
        }
      } catch (error) {
        console.log(error)
        event.sender.send('streaming-error', error)
      }
    })

    pythonProcess.stderr.on('data', (data) => {
      const errorMessage = data.toString().trim()
      console.log(`Python script error: ${errorMessage}`)
    })

    pythonProcess.on('close', (code, signal) => {
      if (code === 0) {
        resolve({ success: true, message: 'Transcription completed.' })
      } else {
        const errorMsg = `Python script exited with code ${code}. Signal: ${signal}. Check logs for details.`
        console.log(errorMsg)
      }
    })

    pythonProcess.on('error', (err) => {
      console.error('Error spawning Python process:', err)
      event.sender.send('streaming-error', `Error spawning process: ${err.message}`)
      reject({ success: false, error: `Error spawning Python process: ${err.message}` })
    })
  })
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  tray?.destroy()
})
