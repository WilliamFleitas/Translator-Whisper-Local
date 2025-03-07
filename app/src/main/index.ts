import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import path, { join } from 'path'
import dotenv from 'dotenv'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn, ChildProcess, exec } from 'child_process'
import fs from 'fs'
import {
  ApiResponse,
  AudioLanguageType,
  DeviceType,
  DurationTimeType,
  HelperNameType,
  ProcessDevicesType,
  StartStreamingType,
  WhisperHelpersType,
  WhisperModelListType,
  CheckGraphicCardType,
  CheckVoicemeeterIsRunningType
} from '../preload'
import textTranslator from './backend/utils/translator/textTranslator'

dotenv.config()

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
const isPackaged = app.isPackaged

const getScriptPath = (packagePath: string[], devPath: string): any => {
  return isPackaged
    ? path.join(
        app.getPath('userData').replace('Roaming', 'Local\\Programs'),
        'resources',
        'src',
        'main',
        'backend',
        'utils',
        ...packagePath
      )
    : path.resolve(__dirname, `../../src/main/backend/utils/${devPath}`)
}

const venvPython = isPackaged
  ? path.join(
      app.getPath('userData').replace('Roaming', 'Local\\Programs'),
      'resources',
      'venv',
      'Scripts',
      'python.exe'
    )
  : path.resolve(__dirname, '../../venv/Scripts/python')

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 450,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    icon: join(__dirname, '../../resources/icon.png'),
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
        nodeIntegration: false,
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
      const scriptPath = getScriptPath(
        [
          'voicemeeterApi',
          `${queryType === 'open' || queryType === 'close' ? vcRunOrClosePath : vcStatusPath}`
        ],
        `voicemeeterApi/${queryType === 'open' || queryType === 'close' ? vcRunOrClosePath : vcStatusPath}`
      )
      if (isPackaged && !fs.existsSync(venvPython)) {
        return resolve({
          success: false,
          error: `Python executable not found at: ${venvPython}`
        })
      }

      const pythonProcess = spawn(venvPython, ['-u', scriptPath, queryType])

      let outputData: ApiResponse<CheckVoicemeeterIsRunningType>

      pythonProcess.stdout.on('data', (data) => {
        const dataToString = data.toString().trim().split('\n')
        try {
          const response: ApiResponse<CheckVoicemeeterIsRunningType> = JSON.parse(dataToString)
          if (response.success) {
            outputData = response
          } else {
            throw Error(response.error)
          }
        } catch (error) {
          return resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })

      pythonProcess.stderr.on('data', (data) => {
        const message = data.toString().trim()
        console.log('mesagetderr:', message)
      })

      pythonProcess.on('error', (error) => {
        return resolve({ success: false, error: error.message })
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputData)
        } else {
          resolve({ success: false, error: `Voicemeter-api ${queryType} script failed` })
        }
      })
    })
  }
)
ipcMain.handle('get_VC_settings_status', async () => {
  return new Promise((resolve) => {
    const scriptPath = getScriptPath(
      ['voicemeeterApi', 'getVCSettingsStatus.py'],
      'voicemeeterApi/getVCSettingsStatus.py'
    )
    if (isPackaged && !fs.existsSync(venvPython)) {
      return resolve({
        success: false,
        error: `Python executable not found at: ${venvPython}`
      })
    }

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
    const scriptPath = getScriptPath(
      ['voicemeeterApi', 'setVCSetup.py'],
      'voicemeeterApi/setVCSetup.py'
    )
    if (isPackaged && !fs.existsSync(venvPython)) {
      return resolve({
        success: false,
        error: `Python executable not found at: ${venvPython}`
      })
    }
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
    const scriptPath = getScriptPath(
      ['getUserDefaultAudioDevice.py'],
      'getUserDefaultAudioDevice.py'
    )
    if (isPackaged && !fs.existsSync(venvPython)) {
      return resolve({
        success: false,
        error: `Python executable not found at: ${venvPython}`
      })
    }
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
    const scriptPath = getScriptPath(['getUserAudioDevices.py'], 'getUserAudioDevices.py')

    if (isPackaged && !fs.existsSync(venvPython)) {
      return resolve({
        success: false,
        error: `Python executable not found at: ${venvPython}`
      })
    }
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
  async (
    event,
    device: DeviceType,
    durationTime: DurationTimeType,
    processDevice: ProcessDevicesType,
    modelName: WhisperModelListType,
    audio_language: AudioLanguageType
  ) => {
    return new Promise((resolve) => {
      const scriptPath = getScriptPath(['speechToTextPy.py'], 'speechToTextPy.py')

      if (isPackaged && !fs.existsSync(venvPython)) {
        return resolve({
          success: false,
          error: `Python executable not found at: ${venvPython}`
        })
      }
      if (startStreamingProcess) {
        return resolve({ success: false, error: 'The capture is already running' })
      }

      startStreamingProcess = spawn(venvPython, [
        '-u',
        scriptPath,
        device,
        durationTime,
        processDevice,
        modelName,
        audio_language
      ])
      let outputData: ApiResponse<StartStreamingType> | null = null
      let translationError: boolean = false

      if (startStreamingProcess && startStreamingProcess.stdout && startStreamingProcess.stderr) {
        startStreamingProcess.stdout.on('data', async (data) => {
          const receivedData = data.toString().trim()
          try {
            const response = JSON.parse(receivedData)
            if (response.success) {
              if (response.data.status !== undefined) {
                if (response.data.status === 0) {
                  event.sender.send('streaming-data', response)
                  if (response.data.transcription.length && !translationError) {
                    try {
                      const translatedText = await textTranslator(
                        response.data.transcription,
                        audio_language,
                        'es'
                      )
                      event.sender.send('translation-data', translatedText)
                    } catch (error: any) {
                      translationError = true
                      event.sender.send('translation-error-data', error.message, translationError)
                    }
                  }
                } else {
                  outputData = response
                }
              }
            } else {
              throw Error(response.error)
            }
          } catch (error: any) {
            startStreamingProcess?.kill()
            startStreamingProcess = null
            return resolve({
              success: false,
              error: error instanceof Error ? error.message : String(error)
            })
          }
        })

        startStreamingProcess.stderr.on('data', (data) => {
          const message = data.toString().trim()
          console.log('mesage2tderr:', message)
        })
      }

      startStreamingProcess.on('error', (error) => {
        startStreamingProcess = null
        return resolve({ success: false, error: error.message })
      })

      startStreamingProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputData)
        } else if (code === null) {
          resolve({
            success: true,
            data: { status: 1, message: 'Audio capturing ended.' }
          })
        } else {
          resolve({ success: false, error: 'Speech to text script failed' })
        }
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
        startStreamingProcess = null

        return { success: true, data: { status: 'Capture finished' } }
      } else {
        return { success: false, data: { status: 'The process was already stopped.' } }
      }
    } catch (error) {
      return { success: false, data: { status: 'Error stopping the process' } }
    }
  } else {
    return { success: false, data: { status: 'No process is running.' } }
  }
})

ipcMain.handle('check-dependencies', async (event) => {
  return new Promise((resolve, reject) => {
    const scriptPath = getScriptPath(['checkGraphicCard.py'], 'checkGraphicCard.py')
    if (isPackaged && !fs.existsSync(venvPython)) {
      return reject({
        success: false,
        error: `Python executable not found at: ${venvPython}`
      })
    }
    const process = spawn(venvPython, ['-u', scriptPath])

    let outputData: ApiResponse<CheckGraphicCardType>

    process.stdout.on('data', (data) => {
      const messages = data.toString().trim().split('\n')

      messages.forEach((message) => {
        try {
          const response: ApiResponse<CheckGraphicCardType> = JSON.parse(message)
          if (response.success) {
            outputData = response
            if (response.data.status !== undefined && Number(response.data.status) === 2) {
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
            if (response.data.status !== undefined && Number(response.data.status) === 0) {
              event.sender.send('check-dependencies-data', response)
            }
          } else {
            throw Error(response.error)
          }
        } catch (error: any) {
          process.kill()
          return resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })
    })

    process.stderr.on('data', (data) => {
      const message = data.toString().trim()
      console.log('mesagetderr:', message)
    })

    process.on('error', (error) => {
      return resolve({ success: false, error: error.message })
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve(outputData)
      } else {
        resolve({ success: false, error: 'Dependency check script failed' })
      }
    })
  })
})

ipcMain.handle(
  'whisper-helpers',
  async (_event, helperName: HelperNameType, model_name?: WhisperModelListType) => {
    return new Promise((resolve, reject) => {
      const getModelsPath = 'getAvailableModels.py'
      const checkInstaledModelsPath = 'downloadModel.py'
      const scriptPath = getScriptPath(
        [
          'whisper',
          helperName === 'get_available_models' ? getModelsPath : checkInstaledModelsPath
        ],
        `whisper/${helperName === 'get_available_models' ? getModelsPath : checkInstaledModelsPath}`
      )

      if (isPackaged && !fs.existsSync(venvPython)) {
        return resolve({
          success: false,
          error: `Python executable not found at: ${venvPython}`
        })
      }
      const process = spawn(venvPython, ['-u', scriptPath, model_name as WhisperModelListType])

      let outputData: WhisperHelpersType

      process.stdout.on('data', (data) => {
        const messages = data.toString().trim().split('\n')

        try {
          const response = JSON.parse(messages)
          if (response.success) {
            if (helperName === 'get_available_models') {
              outputData = { type: helperName, available_models: response.data }
            } else if (helperName === 'download_model') {
              outputData = { type: helperName, download_model_status: response.data }
            }
          } else {
            throw Error(response.error)
          }
        } catch (error: any) {
          return resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })

      process.stderr.on('data', (data) => {
        const message = data.toString().trim()
        console.log('mesage2tderr:', message)
      })

      process.on('error', (error) => {
        return resolve({ success: false, error: error.message })
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, data: outputData })
        } else {
          reject({ success: false, error: `There was an error running ${helperName} script` })
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
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  tray?.destroy()
})
