export {}

declare global {
  interface Window {
    api: {
      openNewWindow: (path: string) => void
      window: {
        close: () => void
        maximize: () => void
        unmaximize: () => void
        isMaximized: () => Promise<boolean>
      }
      usb: {
        list: () => Promise<Device[]>
				disconnect: (id: string) => Promise<void>
        connect: (id: string) => Promise<Device>
        refresh: () => Promise<Device[]>
        onUpdate: (cb: (devices: Device[]) => void) => () => void 
        sendData?: (data: string) => Promise<unknown>
        setupPortReader?: () => Promise<unknown>
        onData?: (cb: (msg: string) => void) => void
        offData?: () => void
      }
    }
  }

	/** define a usb device type */ 
	type Device = {
	  connected?: boolean
		path: string
	  manufacturer?: string
	  serialNumber?: string
	  pnpId?: string
	  locationId?: string
	  productId?: string
	  vendorId?: string
	}
}
