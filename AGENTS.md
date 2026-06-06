# Project Guidelines

This repository contains two main components: an Electron-based console UI and STM32 firmware for a BLDC driver.

## Architecture

- **console/**: A React + TypeScript frontend dashboard running inside an Electron shell. Built using Vite/React and Electron. Communicates with the hardware over serial ports.
- **firmware/**: Embedded C firmware for STM32F411 microcontrollers, using FreeRTOS and the STM32 HAL. Configured with STM32CubeMX and built with CMake/Ninja.

## Code Style

- **Console (TypeScript/React)**: Use functional components, hooks, and electron IPCs. 
- **Firmware (C)**: Keep logic modular and non-blocking using FreeRTOS tasks. Follow standard STM32 HAL structure. **Crucial**: User code must stay within the `/* USER CODE BEGIN ... */` and `/* USER CODE END ... */` comments to avoid deletion when regenerating code with STM32CubeMX. If the user requests code that falls outside of `/* USER CODE BEGIN/END */` blocks or asks to modify HAL configuration C files directly, warn them that this violates repository conventions and advise them to use STM32CubeMX (`firmware/demo_stm32f411.ioc`) instead.

## Build and Test

- **Console**:
  - Requires adding the user to the `dialout` group for serial port access (`sudo usermod -a -G dialout $USER`).
  - Start development mode: `npm run dev` (from the `console` directory).
  - Build application package: `npm run electron:build`.
- **Firmware**:
  - Configured via CMake using `CMakePresets.json`.
  - Typical workflow involves generating Ninja build files and building from the `firmware/build/Debug/` directory (e.g., `ninja -C build/Debug/`).

## Conventions

- Read/write hardware serial communication code should be kept isolated in the appropriate libraries (e.g., `console/electron/lib/serial.ts`).
- Update STM32 configurations via the `firmware/demo_stm32f411.ioc` file using STM32CubeMX rather than editing deep HAL/configuration code directly.
