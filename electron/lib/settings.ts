import { encode } from "cbor"

/** Matches `USB_MSG_SETTINGS` in firmware `bldc.h`. */
export const USB_MSG_SETTINGS = 1

/** CBOR map keys — must stay in sync with `settings_encode` / `settings_decode` in `telem.c`. */
export type SettingsRaw = {
  pp: number
  kv: number
  rs: number
  ls: number
  i_kp: number
  i_ki: number
  s_kp: number
  s_ki: number
  idt: number
  p_kp: number
  p_ki: number
  bemf: number
  obs: number
  min_cl: number
  max_ol: number
  ramp: number
  align: number
  smode: number
  l_i: number
  l_v: number
  l_t: number
  l_cd: number
}

export type MotorSettings = SettingsRaw

export const DEFAULT_MOTOR_SETTINGS: MotorSettings = {
  pp: 7,
  kv: 1000,
  rs: 0.05,
  ls: 0.00001,
  i_kp: 1.0,
  i_ki: 100.0,
  s_kp: 0.1,
  s_ki: 10.0,
  idt: 0.0,
  p_kp: 10.0,
  p_ki: 100.0,
  bemf: 500.0,
  obs: 1.0,
  min_cl: 500.0,
  max_ol: 6000.0,
  ramp: 500.0,
  align: 2.0,
  smode: 0,
  l_i: 40.0,
  l_v: 50.0,
  l_t: 85.0,
  l_cd: 35.0,
}

const SETTINGS_KEYS = Object.keys(DEFAULT_MOTOR_SETTINGS) as (keyof MotorSettings)[]

export const isSettingsPayload = (value: unknown): value is SettingsRaw => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>
  return SETTINGS_KEYS.every((key) => typeof record[key] === "number")
}

export function encodeSettingsMessage(settings: MotorSettings): Buffer {
  const payload: SettingsRaw = { ...settings, smode: Math.round(settings.smode) }
  return Buffer.from(encode([USB_MSG_SETTINGS, payload]))
}