/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  openNewWindow: (path: string) => ipcRenderer.send('open-new-window', path),
  window: {
    close: () => ipcRenderer.send('window:close'),
    maximize: () => ipcRenderer.send('window:maximize'),
    unmaximize: () => ipcRenderer.send('window:unmaximize'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
  usb: {
    list: () => ipcRenderer.invoke("usb:list"),
    connect: (id: string) => ipcRenderer.invoke("usb:connect", id),
		disconnect: (id: string) => ipcRenderer.invoke("usb:disconnect", id),
    refresh: () => ipcRenderer.invoke("usb:refresh"),
    sendData: (data: string) => ipcRenderer.invoke("usb:send-data", data),
    onUpdate: (cb: (devices: any[]) => void) => {
      const handler = (_: any, devices: any[]) => cb(devices)

      ipcRenderer.on("usb:update", handler)

      return () => {
        ipcRenderer.removeListener("usb:update", handler)
      }
    },
	  setupPortReader: () => ipcRenderer.invoke("usb:setup-port-reader"),
	  onData: (callback: (msg: string) => void) => {
	    ipcRenderer.on("usb:data", (_, msg) => callback(msg))
	  },
	  offData: () => {
	    ipcRenderer.removeAllListeners("usb:data")
	  }
  },
})