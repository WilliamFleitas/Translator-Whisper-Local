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

console.log('Ruta al archivo de credenciales:', process.env.GOOGLE_APPLICATION_CREDENTIALS)

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
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
  tray.setToolTip('Mi Aplicación')
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Aplicación',
      click: (): void => {
        mainWindow?.show()
      }
    },
    {
      label: 'Salir',
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

// Canal para iniciar el script de Python
ipcMain.handle('start-streaming', async (event) => {
  return new Promise((resolve, reject) => {
    // Ruta absoluta al script de Python
    const scriptPath = path.resolve(__dirname, '../../src/main/speechToTextPy.py')
    const venvPython = path.resolve(__dirname, '../../venv/Scripts/python')
    console.log('Ejecutando el script de Python...')

    // Ejecutar el script de Python
    const pythonProcess = spawn(venvPython, ['-u', scriptPath, "mic"])
    // Capturar stdout de Python y enviar los datos en tiempo real al frontend
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString().trim()
      console.log(`stdout2323: ${output}`)
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr3434: ${data.toString().trim()}`)
    })

    pythonProcess.on('error', (error) => {
      console.error(`Error al ejecutar el script de Python: ${error.message}`)
      reject(`Error al ejecutar el script de Python: ${error.message}`)
    })

    pythonProcess.on('close', (code) => {
      console.log(`El script de Python terminó con el código: ${code}`)
      if (code === 0) {
        resolve('El script de Python se ejecutó correctamente.')
      } else {
        reject('Error al ejecutar el script de Python.')
      }
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
