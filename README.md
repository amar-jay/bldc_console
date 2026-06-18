# bldc_console
An Electron + React dashboard project.
## Scripts
```bash
cd console
npm install
npm run dev          # Vite + Electron (dev mode)
npm run build:linux  # or build:mac / build:win
```

Linux serial access usually requires:
```bash
sudo usermod -a -G dialout $USER   # then re-login
```

## Protocol
- USB CDC at 115200 baud
- CBOR messages: `[type, payload]`
  - Telemetry (MCU → host)
  - Settings (bidirectional)
  - Debug / error strings

Real ADC data for phase currents, bus voltage, and NTC temperature is live. RPM, angles, and FOC d/q values are currently stubbed (no observer implemented).

## Project Notes
- Full contributor guide, architecture, and "do not" rules live in [AGENTS.md](AGENTS.md).
- The console has its own [console/README.md](console/README.md).
- No root-level LICENSE or detailed hardware schematics are present yet.

## Current Status
Working end-to-end: trapezoidal drive + real telemetry over USB → dashboard charts.  
FOC control loops, settings sync, and DroneCAN I/O are incomplete / stubbed.

For development without hardware, enable `BLDC_TELEM_USE_DEMO` in `stm32g431/Core/Inc/bldc.h`.

> [!NOTE]
> This repository is a part of the BLDC-Motor-Driver project: [https://github.com/alpi753/BLDC-Motor-Driver](https://github.com/alpi753/BLDC-Motor-Driver)