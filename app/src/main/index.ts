import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import path, { join } from 'path'
import dotenv from 'dotenv'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn, ChildProcess, exec } from 'child_process'
import fs from 'fs'
import { HelperNameType, WhisperHelpersType, WhisperModelListType } from '../preload'
dotenv.config()

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
const isPackaged = app.isPackaged
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
  async (_event, queryType: 'isRunning' | 'open' | 'close') => {
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
          } catch (error: any) {
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
ipcMain.handle('get_VC_settings_status', async () => {
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
        } catch (error: any) {
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

ipcMain.handle('set_VC_setup', async (_event, device_name: string) => {
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
        } catch (error: any) {
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

ipcMain.handle('find_default_audio_device', async () => {
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
        } catch (error: any) {
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

ipcMain.handle('find-audio-devices', async () => {
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
        } catch (error: any) {
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

let startStreamingProcess: ChildProcess | null = null

ipcMain.handle(
  'start-streaming',
  async (event, device, durationTime: 'unlimited' | 60 | 600 | 1800 | 3600) => {
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve(__dirname, '../../src/main/backend/utils/speechToTextPy.py')
      const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')

      if (startStreamingProcess) {
        return reject({ success: false, message: 'The capture is already running' })
      }

      startStreamingProcess = spawn(venvPython, ['-u', scriptPath, device, durationTime])
      console.log('Starting streaming with duration:', durationTime)
      let outputData = ''

      if (startStreamingProcess && startStreamingProcess.stdout && startStreamingProcess.stderr) {
        startStreamingProcess.stdout.on('data', (data) => {
          const receivedData = data.toString().trim()
          outputData += receivedData

          try {
            const response = JSON.parse(receivedData)
            if (response.success) {
              event.sender.send('streaming-data', response.data)
            } else {
              throw Error(response.error)
            }
          } catch (error: any) {
            console.log(error)
            event.sender.send('streaming-error', error)
          }
        })

        startStreamingProcess.stderr.on('data', (data) => {
          const errorMessage = data.toString().trim()
          console.log(`Python script error: ${errorMessage}`)
        })
      }

      startStreamingProcess.on('close', (code, signal) => {
        if (code === 0) {
          resolve({ success: true, message: 'Transcription completed.' })
        } else {
          const errorMsg = `Python script exited with code ${code}. Signal: ${signal}. Check logs for details.`
          console.log(errorMsg)
        }
        startStreamingProcess = null
      })

      startStreamingProcess.on('error', (err) => {
        console.error('Error spawning Python process:', err)
        event.sender.send('streaming-error', `Error spawning process: ${err.message}`)
        reject({ success: false, error: `Error spawning Python process: ${err.message}` })
        startStreamingProcess = null
      })
    })
  }
)

ipcMain.handle('stop-streaming', async () => {
  if (startStreamingProcess !== null) {
    try {
      if (!startStreamingProcess.killed) {
        startStreamingProcess.kill()
        console.log('Python process stopped successfully.')
        startStreamingProcess = null

        return { success: true, data: { status: 'capture finished' } }
      } else {
        console.log('The process was already stopped.')
        return { success: false, data: { status: 'The process was already stopped.' } }
      }
    } catch (error) {
      console.error('Error stopping the Python process:', error)
      return { success: false, data: { status: 'Error stopping the process' } }
    }
  } else {
    console.log('No process is running.')
    return { success: false, data: { status: 'No process is running.' } }
  }
})

ipcMain.handle('check-dependencies', async (event) => {
  return new Promise((resolve) => {
    const scriptPath = isPackaged
      ? path.join(
          app.getPath('userData').replace('Roaming', 'Local\\Programs'),
          'resources',
          'src',
          'main',
          'backend',
          'utils',
          'checkGraphicCard.py'
        )
      : path.resolve(__dirname, '../../src/main/backend/utils/checkGraphicCard.py')
    const venvPython = isPackaged
      ? path.join(
          app.getPath('userData').replace('Roaming', 'Local\\Programs'),
          'resources',
          'venv',
          'Scripts',
          'python.exe'
        )
      : path.resolve(__dirname, '../../venv/Scripts/python')
    if (isPackaged && !fs.existsSync(venvPython)) {
      console.error(`Python executable not found at: ${venvPython} and ${scriptPath}`)
      return resolve({
        success: false,
        error: `Python executable not found at: ${venvPython} and ${scriptPath}`
      })
    }
    const process = spawn(venvPython, ['-u', scriptPath])

    let outputData = ''
    let errorData = ''

    process.stdout.on('data', (data) => {
      const messages = data.toString().trim().split('\n')

      messages.forEach((message) => {
        try {
          const response = JSON.parse(message)
          console.log('mesage2,', response)
          if (response.success) {
            outputData = response
            if (message.includes(`Torch successfully installed for ${response.data.gpu_type}`)) {
              if (isPackaged) {
                app.relaunch()
                app.exit()
              } else {
                exec('npm run dev', (err, stdout, stderr) => {
                  if (err) console.error('Error trying to reset:', err)
                  if (stdout) console.log(stdout)
                  if (stderr) console.error(stderr)
                })
                app.exit()
              }
            }
          }
          if (response.interim_message) {
            event.sender.send('check-dependencies-data', response)
          }
        } catch (error: any) {
          console.log('JSON Parser error', error.message, 'on message:', message)
        }
      })
    })

    process.stderr.on('data', (data) => {
      const message = data.toString().trim()
      console.log('mesage2tderr:', message)
      errorData += message + '\n'
    })

    process.on('error', (error) => {
      console.log('mesage2error,', error.message)
      resolve({ success: false, error: error.message })
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve(outputData)
      } else {
        resolve({ success: false, error: errorData || 'Dependency check failed' })
      }
    })
  })
})

ipcMain.handle(
  'whisper-helpers',
  async (_event, helperName: HelperNameType, model_name?: WhisperModelListType) => {
    return new Promise((resolve) => {
      const getModelsPath = 'getAvailableModels.py'
      const checkInstaledModelsPath = 'downloadModel.py'

      const scriptPath = isPackaged
        ? path.join(
            app.getPath('userData').replace('Roaming', 'Local\\Programs'),
            'resources',
            'src',
            'main',
            'backend',
            'utils',
            'whisper',
            helperName === 'get_available_models' ? getModelsPath : checkInstaledModelsPath
          )
        : path.resolve(
            __dirname,
            `../../src/main/backend/utils/whisper/${helperName === 'get_available_models' ? getModelsPath : checkInstaledModelsPath}`
          )
      const venvPython = isPackaged
        ? path.join(
            app.getPath('userData').replace('Roaming', 'Local\\Programs'),
            'resources',
            'venv',
            'Scripts',
            'python.exe'
          )
        : path.resolve(__dirname, '../../venv/Scripts/python')
      if (isPackaged && !fs.existsSync(venvPython)) {
        console.error(`Python executable not found at: ${venvPython} and ${scriptPath}`)
        return resolve({
          success: false,
          error: `Python executable not found at: ${venvPython} and ${scriptPath}`
        })
      }
      const process = spawn(venvPython, ['-u', scriptPath, model_name as WhisperModelListType])

      let outputData: WhisperHelpersType
      let errorData = ''

      process.stdout.on('data', (data) => {
        const messages = data.toString().trim().split('\n')

        try {
          const response = JSON.parse(messages)
          console.log('mesage2,', response)
          if (response.success) {
            if (helperName === 'get_available_models') {
              outputData = { type: helperName, available_models: response.data }
            } else if (helperName === 'download_model') {
              outputData = { type: helperName, download_model_status: response.data }
            }
          }
        } catch (error: any) {
          console.log('JSON Parser error', error.message, 'on message:', messages)
        }
      })

      process.stderr.on('data', (data) => {
        const message = data.toString().trim()
        console.log('mesage2tderr:', message)
        errorData += message + '\n'
      })

      process.on('error', (error) => {
        console.log('mesage2error,', error.message)
        resolve({ success: false, error: error.message })
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, data: outputData })
        } else {
          resolve({ success: false, error: errorData || 'There was an error, code exit: ' + code })
        }
      })
    })
  }
)

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
