import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import isDev from 'electron-is-dev'

// Multi-window support
const windows = new Set<BrowserWindow>()

export function createWindow(urlPath: string = '') {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

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

// demo in-memory device list to simulate USB devices
let devices = [
  { id: "1", name: "BLDC Controller", vendor: "ACME", connected: false },
  { id: "2", name: "Motor Debugger", vendor: "ACME", connected: false },
]

ipcMain.handle("usb:list", async () => {
  return devices
})

ipcMain.handle("usb:connect", async (_, id: string) => {
  devices = devices.map(d =>
    d.id === id ? { ...d, connected: true } : d
  )

  return devices.find(d => d.id === id)
})

ipcMain.handle("usb:refresh", async () => {
  // simulate re-scan
  return devices
})
// -----------------------------------------



app.whenReady().then(() => {
  createWindow()

  // Example IPC for opening new windows from frontend
  ipcMain.on('open-new-window', (_event, path) => {
    createWindow(path)
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