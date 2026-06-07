# BLDC Motor Controller

A two-part BLDC motor control system: embedded firmware on STM32F411 + a desktop dashboard for real-time telemetry and diagnostics.

## Overview

- **firmware/** — Embedded C targeting STM32F411 (Cortex-M4F). Drives a 3-phase BLDC via TI DRV8323R gate driver, samples phase currents, bus voltage, and temperature over ADC, and streams structured telemetry over USB CDC using CBOR. Includes trapezoidal (6-step) commutation today; scaffolding exists for sensorless FOC and DroneCAN (not fully wired yet).

- **console/** — Electron + React + TypeScript desktop app. Connects over serial, decodes live CBOR telemetry frames, and renders charts for currents, voltages, temperature, and motor state. Designed as a diagnostics / tuning interface for ESC development.

**Goal**: Sensorless FOC diagnostics, ESC tuning, and DroneCAN integration.

## Quick Start

### Firmware
```bash
cd firmware
cmake --preset Debug
cmake --build --preset Debug
# Flash (requires OpenOCD + ST-Link):
make flash
```

See [firmware/Makefile](firmware/Makefile) for targets and DSDL generation (DroneCAN).

### Console
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

For development without hardware, enable `BLDC_TELEM_USE_DEMO` in `firmware/Core/Inc/bldc.h`.
