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