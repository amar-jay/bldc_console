import { Button } from "@/components/ui/button"
import TopBar from '@/components/top-bar'
import MotorSpeedCard, { type MotorSpeedPoint } from '@/cards/motor-speed'
import PhaseCurrentsCard, { type PhaseCurrentPoint } from '@/cards/phase-currents'
import BatteryCapCard from '@/cards/battery-cap'
import MotorXticsCard, { type MotorXticPoint } from '@/cards/motor-xtics'
import PhaseVoltageCard, { type PhaseVoltagePoint } from '@/cards/phase-voltage'
import ElecMechAngleCard, { type AnglePoint } from '@/cards/elec-mech-angle'
import DQRefFrameCard, { type DQFramePoint } from '@/cards/dq-ref-frame'
import { CardWrapper } from '@/components/card-wrapper'
import * as React from "react"

export default function Main() {
  const [telemetry, setTelemetry] = React.useState<TelemetryData | null>(null)
  const [telemetryHistory, setTelemetryHistory] = React.useState<TelemetryData[]>([])

  React.useEffect(() => {
    const unsubscribeTelemetry = window.api.usb.onTelemetry?.((nextTelemetry) => {
      setTelemetry(nextTelemetry)
      setTelemetryHistory((prev) => [...prev, nextTelemetry].slice(-40))
    })

    return () => {
      unsubscribeTelemetry?.()
    }
  }, [])

  const formatSampleTime = React.useCallback((item: TelemetryData, index: number): string => {
    const raw = Number(item.timestamp_ms)
    if (Number.isFinite(raw) && raw > 0) {
      return `${raw}ms`
    }

    return `t${index + 1}`
  }, [])

  const speedData = React.useMemo<MotorSpeedPoint[]>(() => {
    if (telemetryHistory.length === 0) return []

    return telemetryHistory.map((item, index) => ({
      time: formatSampleTime(item, index),
      rpm: item.speed.actual_rpm,
      target: item.speed.target_rpm,
    }))
  }, [formatSampleTime, telemetryHistory])

  const phaseCurrentData = React.useMemo<PhaseCurrentPoint[]>(() => {
    if (!telemetry) return []

    return [
      { phase: 'Phase A', current: telemetry.currents.phase_a },
      { phase: 'Phase B', current: telemetry.currents.phase_b },
      { phase: 'Phase C', current: telemetry.currents.phase_c },
    ]
  }, [telemetry])

  const dqData = React.useMemo<DQFramePoint[]>(() => {
    if (telemetryHistory.length === 0) return []

    return telemetryHistory.map((item, index) => ({
      time: formatSampleTime(item, index),
      id: item.currents.i_d,
      iq: item.currents.i_q,
    }))
  }, [formatSampleTime, telemetryHistory])

  const angleData = React.useMemo<AnglePoint[]>(() => {
    if (telemetryHistory.length === 0) return []

    return telemetryHistory.map((item, index) => ({
      time: formatSampleTime(item, index),
      mechanical: item.angles.mechanical_deg,
      electrical: item.angles.electrical_deg,
    }))
  }, [formatSampleTime, telemetryHistory])

  const phaseVoltageData = React.useMemo<PhaseVoltagePoint[]>(() => {
    if (telemetryHistory.length === 0) return []

    return telemetryHistory.map((item, index) => ({
      time: formatSampleTime(item, index),
      phaseA: item.voltages.phase_a,
      phaseB: item.voltages.phase_b,
      phaseC: item.voltages.phase_c,
    }))
  }, [formatSampleTime, telemetryHistory])

  const motorXticData = React.useMemo<MotorXticPoint[]>(() => {
    if (!telemetry) return []

    const clampPercent = (value: number) => Math.max(0, Math.min(100, value))
    const rpmFactor = clampPercent((telemetry.speed.actual_rpm / 6000) * 100)
    const angleStability = clampPercent(100 - Math.abs(telemetry.angles.error_deg) * 2)

    return [
      {
        attribute: 'B-EMF Strength',
        phaseA: clampPercent(telemetry.observer.bemf_strength),
        phaseB: clampPercent(telemetry.observer.bemf_strength - 2),
        phaseC: clampPercent(telemetry.observer.bemf_strength - 1),
      },
      {
        attribute: 'Obs. Confidence',
        phaseA: clampPercent(telemetry.observer.confidence),
        phaseB: clampPercent(telemetry.observer.confidence - 1),
        phaseC: clampPercent(telemetry.observer.confidence - 2),
      },
      {
        attribute: 'PLL Lock',
        phaseA: telemetry.observer.pll_lock ? 100 : 25,
        phaseB: telemetry.observer.pll_lock ? 98 : 24,
        phaseC: telemetry.observer.pll_lock ? 96 : 23,
      },
      {
        attribute: 'Model Fit',
        phaseA: 88,
        phaseB: 88,
        phaseC: 88,
      },
      {
        attribute: 'Z-Cross Stab.',
        phaseA: angleStability,
        phaseB: clampPercent(angleStability - 1),
        phaseC: clampPercent(angleStability - 2),
      },
      {
        attribute: 'Low-Spd Rel.',
        phaseA: clampPercent(100 - rpmFactor),
        phaseB: clampPercent(100 - rpmFactor - 2),
        phaseC: clampPercent(100 - rpmFactor - 4),
      },
      {
        attribute: 'High-Spd Stab.',
        phaseA: rpmFactor,
        phaseB: clampPercent(rpmFactor - 2),
        phaseC: clampPercent(rpmFactor - 1),
      },
      {
        attribute: 'Noise Immun.',
        phaseA: 76,
        phaseB: 75,
        phaseC: 74,
      },
    ]
  }, [telemetry])

  const batteryUsedWh = telemetry?.power.energy_used_wh
  const batteryRemainingWh = telemetry?.power.energy_remaining_wh

  const openSettingsWindow = () => {
    if (window.api) {
      window.api.openNewWindow('settings')
    } else {
      console.warn('Electron API is not available in the browser environment.')
    }
  }

  return (
		<div className="min-h-screen bg-background text-foreground">

		<TopBar/>
		<div className="flex px-6 pt-3 max-w-md min-w-0 flex-col gap-1 text-sm leading-loose w-full">
			  {/* <h1 className="font-medium">BLDC Console</h1> */}
			  <p className="text-sm">
			    Real-time sensorless FOC diagnostics, motor telemetry, and ESC tuning interface.
			  </p>

			  <p className="text-xs text-muted-foreground">
			    By Alperen Sahin & Amar Jay
			  </p>

			  <Button onClick={openSettingsWindow} className="mt-1 w-max">
			    Connect ESC
			  </Button>
				<div className="font-mono text-xs text-muted-foreground">
			</div>
		</div>
    <div className="flex px-6">
      <div className="px-6 pt-6 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-cols-1 min-w-md gap-4 text-sm leading-loose w-full">
        
				{/* <div> */}
        <CardWrapper title="Motor Speed" route="card/motor-speed">
				  <MotorSpeedCard data={speedData} />
        </CardWrapper>

        <CardWrapper title="Phase Currents" route="card/phase-currents">
				  <PhaseCurrentsCard data={phaseCurrentData} />
        </CardWrapper>

        <CardWrapper title="DQ Reference Frame" route="card/dq-frame">
          <DQRefFrameCard data={dqData} />
        </CardWrapper>

        <CardWrapper title="Electrical vs Mechanical Angle" route="card/elec-mech">
          <ElecMechAngleCard data={angleData} />
        </CardWrapper>

        <CardWrapper title="Phase Voltages" route="card/phase-voltage">
				  <PhaseVoltageCard data={phaseVoltageData} />
        </CardWrapper>

        <CardWrapper title="Motor Characteristics" route="card/motor-xtics">
				  <MotorXticsCard data={motorXticData} />
        </CardWrapper>

        <CardWrapper title="Battery Capacity" route="card/battery-cap">
				  <BatteryCapCard
						usedWh={batteryUsedWh}
						remainingWh={batteryRemainingWh}
					/>
        </CardWrapper>
				</div>


      {/* </div> */}
    </div>
		</div>
  )
}