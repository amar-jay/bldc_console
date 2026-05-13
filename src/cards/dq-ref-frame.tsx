import { LineChart } from "@/components/charts/line"

// Sample DQ Frame data (Direct and Quadrature current)
const generateDQData = () => {
  const data = []
  for (let i = 0; i < 50; i++) {
    data.push({
      time: `${i}ms`,
      id: 5.0 + (Math.random() - 0.5) * 0.2, // Direct current (usually regulated to 0 or constant)
      iq: 12.0 + (Math.random() - 0.5) * 0.5, // Quadrature current (torque producing)
    })
  }
  return data
}

const dqData = generateDQData()

export default function DQRefFrameCard() {
  return (
    <div className="size-full flex flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 space-y-1 shrink-0">
        <h2 className="text-sm font-medium">DQ Reference Frame</h2>
        <p className="text-xs text-muted-foreground">
          Real-time tracking of torque (Iq) and flux (Id) components.
        </p>
      </div>
      <div className="flex-1 w-full animate-in fade-in duration-500">
        <LineChart
          className="aspect-auto min-h-[200px]"
          data={dqData}
          xKey="time"
          series={[
            { dataKey: 'iq', label: 'Iq (Torque)', color: 'var(--chart-2)', type: 'monotone' },
            { dataKey: 'id', label: 'Id (Flux)', color: 'var(--chart-1)', type: 'monotone' },
          ]}
          showGrid={true}
          yTickFormatter={(val) => `${val}A`}
          tooltipLabelFormatter={(val) => `Time: ${val}`}
        />
      </div>
    </div>
  )
}