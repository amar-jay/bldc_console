import { SerialPort } from "serialport"

const isLikelyUsbDevice = (path: string) => {
  return (
    path.includes("ttyUSB") ||
    path.includes("ttyACM") ||
    path.includes("cu.usb") ||
    path.startsWith("COM")
  )
}

export async function listDevices() {
  try {
    const ports = await SerialPort.list()

    return ports
      .filter((port) => port.path && isLikelyUsbDevice(port.path))
      .map((port) => ({
        path: port.path,
        manufacturer: port.manufacturer ?? undefined,
        serialNumber: port.serialNumber ?? undefined,
        pnpId: port.pnpId ?? undefined,
        locationId: port.locationId ?? undefined,
        productId: port.productId ?? undefined,
        vendorId: port.vendorId ?? undefined,
      }))
  } catch (error) {
    throw new Error(
      `Failed to list serial ports: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export async function connectDevice(path: string) {
  try {
    const port = new SerialPort({
      path,
      baudRate: 115200,
      autoOpen: false,
    })

    return new Promise((resolve, reject) => {
      port.open((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(port)
        }
      })
    })
  } catch (error) {
		throw new Error(
			`Failed to connect to device at ${path}: ${
				error instanceof Error ? error.message : String(error)
			}`
		)
	}
}