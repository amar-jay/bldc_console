import type { MotorSettings } from "@/types/settings"

export const MOTOR_SETTINGS_STORAGE_KEY = "bldc.motor-settings.v1"

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

export function loadMotorSettings(): MotorSettings {
  try {
    const raw = localStorage.getItem(MOTOR_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_MOTOR_SETTINGS }
    }

    const parsed = JSON.parse(raw) as Partial<MotorSettings>
    return { ...DEFAULT_MOTOR_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_MOTOR_SETTINGS }
  }
}

export function saveMotorSettings(settings: MotorSettings): void {
  localStorage.setItem(MOTOR_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}