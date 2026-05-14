import { LineChart } from "@/components/charts/line"

export type MotorSpeedPoint = {
  time: string
  rpm: number
  target: number
}

const fallbackMotorSpeedData: MotorSpeedPoint[] = [
  { time: '08:00', rpm: 1240, target: 1200 },
  { time: '08:05', rpm: 1310, target: 1250 },
  { time: '08:10', rpm: 1385, target: 1325 },
  { time: '08:15', rpm: 1460, target: 1400 },
  { time: '08:20', rpm: 1425, target: 1400 },
  { time: '08:25', rpm: 1510, target: 1480 },
]

type MotorSpeedCardProps = {
  data?: MotorSpeedPoint[]
}

export default function MotorSpeedCard({ data }: MotorSpeedCardProps) {
	const chartData = data && data.length > 0 ? data : fallbackMotorSpeedData

	return (
        <div className="size-full flex flex-col rounded-xl border bg-card p-4 shadow-sm break-inside-avoid">
          <div className="mb-4 space-y-1 shrink-0">
            <h2 className="text-sm font-medium">Motor speed trend</h2>
            <p className="text-xs text-muted-foreground">
              A reusable line chart example for live telemetry and setpoint tracking.
            </p>
          </div>
          <div className="flex-1 min-h-60 w-full animate-in fade-in duration-500">
            <LineChart
              className="size-full"
              data={chartData}
              xKey="time"
              series={[
                { dataKey: 'rpm', label: 'Actual RPM' },
                { dataKey: 'target', label: 'Target RPM', dashArray: '6 6' },
              ]}
              tooltipLabelFormatter={(value) => `Time: ${String(value)}`}
            />
          </div>
        </div>
	);
}