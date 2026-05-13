export {}

declare global {
  interface Window {
    api: {
      openNewWindow: (path: string) => void
      usb: {
        list: () => Promise<Device[]>
        connect: (id: string) => Promise<Device>
        refresh: () => Promise<Device[]>
        onUpdate: (cb: (devices: Device[]) => void) => () => void 
      }
    }
  }

	/** define a usb device type */ 
	type Device = {
	  id: string
	  name: string
	  vendor?: string
	  connected?: boolean
	}
}
