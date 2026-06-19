import { SerialPort } from "serialport"
import { decodeFirstSync } from "cbor"
import type { BLDCTelemetry, TelemetryRaw } from "./telemetry"
import { DEVICE_ID_LEN } from "./telemetry"
import {
  encodeSettingsMessage,
  isSettingsPayload,
  type MotorSettings,
  USB_MSG_SETTINGS,
} from "./settings"

type CborDecodeResult = {
  value: unknown
  /** Number of input bytes consumed by this decode. */
  length: number
}

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

const initializedPorts = new Set<SerialPort>()

type PortReaderHandlers = {
  onMessage?: (msg: string) => void
  onTelemetry?: (telemetry: BLDCTelemetry) => void
  onSettings?: (settings: MotorSettings) => void
}


const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const isTelemetryPayload = (value: unknown): value is TelemetryRaw => {
  if (!isRecord(value)) return false

  return (
    typeof value.rpm === "number" &&
    typeof value.rpm_t === "number" &&
    typeof value.ts === "number" &&
		typeof value.v_a === "number" &&
		typeof value.v_b === "number" &&
		typeof value.v_c === "number" &&
		typeof value.i_a === "number" &&
		typeof value.i_b === "number" &&
		typeof value.i_c === "number"
  )
}

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

const mapDeviceId = (id: TelemetryRaw["id"]): string => {
  if (!id || id.length === 0) {
    return ""
  }

  const trimmed =
    id.length >= DEVICE_ID_LEN ? id.subarray(0, DEVICE_ID_LEN) : id
  return bytesToHex(trimmed)
}

const mapTelemetry = (payload: TelemetryRaw): BLDCTelemetry => {
  return {
    device_id: mapDeviceId(payload.id),
    speed: {
      actual_rpm: Number(payload.rpm),
      target_rpm: Number(payload.rpm_t),
    },
		temperature: Number(payload.temp ?? 0),
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

export async function sendBinaryToPort(
  port: SerialPort,
  data: Buffer
): Promise<void> {
  if (data.length === 0) {
    return
  }

  return new Promise((resolve, reject) => {
    port.write(data, (err) => {
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

export async function sendSettingsToPort(
  port: SerialPort,
  settings: MotorSettings
): Promise<void> {
  return sendBinaryToPort(port, encodeSettingsMessage(settings))
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


export function setupPortReader(port: SerialPort, handlers: PortReaderHandlers) {
  if (initializedPorts.has(port)) return;

  initializedPorts.add(port);

  let buffer = Buffer.alloc(0);

  const onData = (data: Buffer) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length > 0) {
      try {
        const decoded = decodeFirstSync(buffer, {
          extendedResults: true,
        }) as CborDecodeResult;

        const consumed = decoded.length;
        if (!consumed || consumed <= 0) {
          break;
        }

        const frame = decoded.value;

        buffer = buffer.subarray(consumed);

        if (Array.isArray(frame) && frame.length >= 2) {
          const [msgType, payload] = frame;
          if (msgType === USB_MSG_SETTINGS && isSettingsPayload(payload)) {
            handlers.onSettings?.(payload);
          } else if (isTelemetryPayload(payload)) {
            handlers.onTelemetry?.(mapTelemetry(payload));
          } else if (typeof payload === "string") {
            handlers.onMessage?.(payload);
          } else if (isRecord(payload)) {
            handlers.onMessage?.(JSON.stringify(payload));
          } else {
            handlers.onMessage?.(JSON.stringify(frame));
          }
        }
      } catch {
        // WAIT for more data, do NOT break or reset (CBOR decode errors are expected until full frames are received)
        break;
      }
    }
  };

  const cleanup = () => {
    port.off("data", onData);
    port.off("error", cleanup);
    port.off("close", cleanup);

    buffer = Buffer.alloc(0);
    initializedPorts.delete(port);
  };

  port.on("data", onData);
  port.on("error", cleanup);
  port.on("close", cleanup);
}