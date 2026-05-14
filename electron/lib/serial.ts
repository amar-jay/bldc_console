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
      }`, { cause: error }
    )
  }
}

export async function connectDevice(path: string): Promise<SerialPort> {
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
      }`,
      { cause: error }
		)
	}
}

const dataBufferMap = new Map<SerialPort, string>()
const initializedPorts = new Set<SerialPort>()

export async function sendDataToPort(
  port: SerialPort,
  data: string
): Promise<void> {
  const payload = data.endsWith("\n")
    ? data
    : data + "\n"

  return new Promise((resolve, reject) => {
    port.write(payload, (err) => {
      if (err) {
        reject(err)
        return
      }

      port.drain((drainErr) => {
        if (drainErr) {
          reject(drainErr)
        } else {
          resolve()
        }
      })
    })
  })
}

export function setupPortReader(
  port: SerialPort,
  onMessage: (msg: string) => void
) {
  // Prevent duplicate setup
  if (initializedPorts.has(port)) {
    return
  }

  initializedPorts.add(port)
  dataBufferMap.set(port, "")

  const onData = (data: Buffer) => {
    const previous = dataBufferMap.get(port) ?? ""

    const buffer =
      previous + data.toString("utf8")

    const lines = buffer.split(/\r?\n/)

    // Save incomplete tail
    dataBufferMap.set(
      port,
      lines.pop() ?? ""
    )

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.length > 0) {
        onMessage(trimmed)
      }
    }
  }

  const onError = (err: Error) => {
    console.error("Serial error:", err)
    cleanup()
  }

  const onClose = () => {
    cleanup()
  }

  const cleanup = () => {
    port.off("data", onData)
    port.off("error", onError)
    port.off("close", onClose)

    dataBufferMap.delete(port)
    initializedPorts.delete(port)
  }

  port.on("data", onData)
  port.on("error", onError)
  port.on("close", onClose)
}
