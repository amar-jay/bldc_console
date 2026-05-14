import { SerialPort } from "serialport"
import { decodeFirstSync } from "cbor"
import type { BLDCTelemetry, TelemetryRaw } from "./telemetry"

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
const cborBufferMap = new Map<SerialPort, Buffer>()
const initializedPorts = new Set<SerialPort>()

type PortReaderHandlers = {
  onMessage?: (msg: string) => void
  onTelemetry?: (telemetry: BLDCTelemetry) => void
}


const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const isTelemetryPayload = (value: unknown): value is TelemetryRaw => {
  if (!isRecord(value)) return false

  return (
    typeof value.rpm === "number" &&
    typeof value.rpm_t === "number" &&
    typeof value.ts === "number"
  )
}

const mapTelemetry = (payload: TelemetryRaw): BLDCTelemetry => {
  return {
    speed: {
      actual_rpm: Number(payload.rpm),
      target_rpm: Number(payload.rpm_t),
    },
    currents: {
      phase_a: Number(payload.i_a),
      phase_b: Number(payload.i_b),
      phase_c: Number(payload.i_c),
      i_d: Number(payload.i_d),
      i_q: Number(payload.i_q),
    },
    voltages: {
      phase_a: Number(payload.v_a),
      phase_b: Number(payload.v_b),
      phase_c: Number(payload.v_c),
      battery: Number(payload.v_bat),
    },
    angles: {
      mechanical_deg: Number(payload.ang_m),
      electrical_deg: Number(payload.ang_e),
      error_deg: Number(payload.ang_err),
    },
    observer: {
      bemf_strength: Number(payload.bemf),
      confidence: Number(payload.obs),
      pll_lock: Number(payload.pll),
    },
    power: {
      battery_current: Number(payload.i_bat),
      energy_used_wh: Number(payload.e_used),
      energy_remaining_wh: Number(payload.e_rem),
    },
    timestamp_ms: Number(payload.ts),
  }
}

const isMostlyText = (buf: Buffer): boolean => {
  if (buf.length === 0) return false

  let printable = 0
  for (const byte of buf) {
    const isAsciiPrintable = byte >= 0x20 && byte <= 0x7e
    const isWhitespace = byte === 0x09 || byte === 0x0a || byte === 0x0d
    if (isAsciiPrintable || isWhitespace) printable += 1
  }

  return printable / buf.length > 0.9
}

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
  handlers: PortReaderHandlers
) {
  // Prevent duplicate setup
  if (initializedPorts.has(port)) {
    return
  }

  initializedPorts.add(port)
  dataBufferMap.set(port, "")
  cborBufferMap.set(port, Buffer.alloc(0))

  const onData = (data: Buffer) => {
    const previousCbor = cborBufferMap.get(port) ?? Buffer.alloc(0)
    let combined = Buffer.concat([previousCbor, data])

    let offset = 0
    while (offset < combined.length) {
      try {
        const decoded = decodeFirstSync(combined.subarray(offset), {
          extendedResults: true,
        }) as { value: unknown; bytes: number }

        if (!decoded || typeof decoded.bytes !== "number" || decoded.bytes <= 0) {
          break
        }

        offset += decoded.bytes

        const frame = decoded.value
        if (Array.isArray(frame) && frame.length >= 2) {
          const payload = frame[1]

          if (isTelemetryPayload(payload)) {
            handlers.onTelemetry?.(mapTelemetry(payload))
            continue
          }

          if (typeof payload === "string") {
            handlers.onMessage?.(payload)
            continue
          }

          if (isRecord(payload)) {
            handlers.onMessage?.(JSON.stringify(payload))
            continue
          }
        }

        if (typeof frame === "string") {
          handlers.onMessage?.(frame)
        }
      } catch {
        break
      }
    }

    combined = combined.subarray(offset)
    cborBufferMap.set(port, combined)

    if (combined.length === 0 || !isMostlyText(combined)) {
      return
    }

    const previousText = dataBufferMap.get(port) ?? ""
    const text = previousText + combined.toString("utf8")
    const lines = text.split(/\r?\n/)
    dataBufferMap.set(port, lines.pop() ?? "")

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 0) {
        handlers.onMessage?.(trimmed)
      }
    }

    cborBufferMap.set(port, Buffer.alloc(0))
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
    cborBufferMap.delete(port)
    initializedPorts.delete(port)
  }

  port.on("data", onData)
  port.on("error", onError)
  port.on("close", onClose)
}
