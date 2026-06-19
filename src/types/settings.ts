/** CBOR map keys — keep in sync with firmware `telem.c` and `electron/lib/settings.ts`. */
export type MotorSettings = {
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