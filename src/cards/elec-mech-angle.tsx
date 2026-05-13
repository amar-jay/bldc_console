import { LineChart } from "@/components/charts/line"

// Sample time-series angle data
// Electrical angle = (Mechanical angle * PolePairs) mod 360
const generateAngleTimeSeries = () => {
  const data = []
  const polePairs = 7
  const totalPoints = 50
  
  for (let i = 0; i < totalPoints; i++) {
    const time = i
    const mechanical = (i * 15) % 360 // Simulating rotation over time
    data.push({
      time: `${time}ms`,
      mechanical: mechanical,
      electrical: (mechanical * polePairs) % 360,
    })
  }
  return data
}

const angleTimeSeriesData = generateAngleTimeSeries()

export default function ElecMechAngleCard() {
  return (
    <div className="size-full flex flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 space-y-1 shrink-0">
        <h2 className="text-sm font-medium">Elec. vs Mech. Angle (Live)</h2>
        <p className="text-xs text-muted-foreground">
          Real-time time-series tracking of motor rotor position vs. magnetic field cycles.
        </p>
      </div>
      <div className="flex-1 min-h-[200px] w-full animate-in fade-in duration-500">
        <LineChart
          className="size-full"
          data={angleTimeSeriesData}
          xKey="time"
          series={[
            { dataKey: 'mechanical', label: 'Mech Angle', color: 'var(--chart-1)', type: 'linear', strokeWidth: 2 },
            { dataKey: 'electrical', label: 'Elec Angle', color: 'var(--chart-2)', type: 'linear', strokeWidth: 1.5 },
          ]}
          showGrid={true}
          yTickFormatter={(val) => `${val}°`}
          tooltipLabelFormatter={(val) => `Time: ${val}`}
        />
      </div>
    </div>
  )
}