import { LineChart } from "@/components/charts/line"

// Sample sine wave data for 3 phases: sin(x), sin(x - 120°), sin(x - 240°)
const generatePhaseData = () => {
  const data = []
  for (let i = 0; i < 360; i += 10) {
    const rad = (i * Math.PI) / 180
    data.push({
      angle: i,
      phaseA: Math.sin(rad) * 230,
      phaseB: Math.sin(rad - (2 * Math.PI) / 3) * 230,
      phaseC: Math.sin(rad - (4 * Math.PI) / 3) * 230,
    })
  }
  return data
}

const phaseVoltageData = generatePhaseData()

export default function PhaseVoltageCard() {
  return (
    <div className="size-full flex flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 space-y-1 shrink-0">
        <h2 className="text-sm font-medium">Phase Voltages (Sinusoidal)</h2>
        <p className="text-xs text-muted-foreground">
          Real-time waveform tracking for Phase A, B, and C.
        </p>
      </div>
      <div className="flex-1 min-h-[200px] w-full animate-in fade-in duration-500">
        <LineChart
          className="size-full"
          data={phaseVoltageData}
          xKey="angle"
          series={[
            { dataKey: 'phaseA', label: 'Phase A', color: 'var(--chart-1)', type: 'monotone' },
            { dataKey: 'phaseB', label: 'Phase B', color: 'var(--chart-2)', type: 'monotone' },
            { dataKey: 'phaseC', label: 'Phase C', color: 'var(--chart-5)', type: 'monotone' },
          ]}
          xTickFormatter={(val) => `${val}°`}
          tooltipLabelFormatter={(val) => `Angle: ${val}°`}
        />
      </div>
    </div>
  )
}