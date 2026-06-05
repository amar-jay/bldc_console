export type BLDCTelemetry = {
  speed: {
    actual_rpm: number
    target_rpm: number
  }

  currents: {
    phase_a: number
    phase_b: number
    phase_c: number
    i_d: number
    i_q: number
  }

  voltages: {
    phase_a: number
    phase_b: number
    phase_c: number
    battery: number
  }

  angles: {
    mechanical_deg: number
    electrical_deg: number
    error_deg: number
  }

  observer: {
    bemf_strength: number
    confidence: number
    pll_lock: number
  }

  power: {
    battery_current: number
    energy_used_wh: number
    energy_remaining_wh: number
  }

  timestamp_ms: number
}

export type TelemetryRaw = {
  rpm: number
  rpm_t: number
  i_a: number
  i_b: number
  i_c: number
  v_a: number
  v_b: number
  v_c: number
  i_d: number
  i_q: number
  ang_m: number
  ang_e: number
  ts: number
  v_bat: number
  i_bat: number
  e_used: number
  e_rem: number
  bemf: number
  obs: number
  pll: number
  ang_err: number
}