import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import isDev from 'electron-is-dev'
import { connectDevice, listDevices } from './lib/serial'
import { Menu } from 'electron'

// Multi-window support
const windows = new Set<BrowserWindow>()

export function createWindow(urlPath: string = '') {
  const isSubWindow = urlPath !== ''
  
  const win = new BrowserWindow({
    width: isSubWindow ? 700 : 1024,
    height: isSubWindow ? 570 : 768,
    frame: isSubWindow? false: true, // Ensure transparent/rounded works everywhere
    transparent: isSubWindow ? true: false, // Required for rounded corners on frameless windows
    titleBarStyle: isSubWindow ? 'hidden' : 'default', // Hide title bar for sub-windows
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

	Menu.setApplicationMenu(null)

  const url = isDev
    ? `http://localhost:5173/#/${urlPath}`
    : `file://${join(__dirname, '../dist/index.html')}#/${urlPath}`

  win.loadURL(url)

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  windows.add(win)

  win.on('closed', () => {
    windows.delete(win)
  })

  return win
}

// ---- usb related IPC handlers (example) ----

let devices: any[] = []
let connectedPort: any = null
let connectedPath: string | null = null

ipcMain.handle("usb:list", async () => {
  const freshDevices = await listDevices()
  devices = freshDevices.map((d) => ({
    ...d,
    connected: d.path === connectedPath,
  }))
  return devices
})

ipcMain.handle("usb:connect", async (_, path: string) => {
  try {
    if (connectedPath === path) return devices.find((d) => d.path === path)

    if (connectedPort) {
      // close current connection before opening new one
      await new Promise<void>((resolve, reject) => {
        connectedPort.close((err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
      connectedPort = null
      connectedPath = null
    }

    connectedPort = await connectDevice(path)
    connectedPath = path

    devices = devices.map((d) =>
      d.path === path ? { ...d, connected: true } : { ...d, connected: false }
    )

    // Notify all windows about the change
    windows.forEach(win => {
      win.webContents.send("usb:on-update", devices)
    })

    return devices.find((d) => d.path === path)
  } catch (error) {
    console.error("USB Connect Error:", error)
    throw error
  }
})

ipcMain.handle("usb:refresh", async () => {
  const freshDevices = await listDevices()
  devices = freshDevices.map((d) => ({
    ...d,
    connected: d.path === connectedPath,
  }))
  return devices
})

ipcMain.handle("usb:disconnect", async (_, path: string) => {
  try {
    if (connectedPort && connectedPath === path) {
      // Assuming SerialPort instance has a close method
      await new Promise<void>((resolve, reject) => {
        connectedPort.close((err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
      connectedPort = null
      connectedPath = null
    }

    devices = devices.map((d) =>
      d.path === path ? { ...d, connected: false } : d
    )

    // Notify all windows about the change
    windows.forEach(win => {
      win.webContents.send("usb:on-update", devices)
    })

    return devices.find((d) => d.path === path)
  } catch (error) {
    console.error("USB Disconnect Error:", error)
    throw error
  }
})
// -----------------------------------------



app.whenReady().then(() => {
  createWindow()

  // Example IPC for opening new windows from frontend
  ipcMain.on('open-new-window', (_event, path) => {
    createWindow(path)
  })

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.maximize()
  })

  ipcMain.on('window:unmaximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.unmaximize()
  })

  ipcMain.handle('window:is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (windows.size === 0) {
    createWindow()
  }
})