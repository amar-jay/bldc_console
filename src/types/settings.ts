/** CBOR map keys — keep in sync with firmware `telem.c` and `electron/lib/settings.ts`. */
export type MotorSettings = {
  pp: number
  rs: number
  ls: number
  i_kp: number
  i_ki: number
  s_kp: number
  s_ki: number
  p_kp: number
  p_ki: number
  obs: number
  min_cl: number
  max_ol: number
  ramp: number
  align_t: number
  ol_ramp: number
  align: number
  rpm_t: number
  smode: number
  l_i: number
}