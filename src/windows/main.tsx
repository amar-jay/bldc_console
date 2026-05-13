import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line"
import { BarChart } from "@/components/charts/bar"
import { RadarChart } from "@/components/charts/radar"
import { RadialChart } from "@/components/charts/radial"
import TopBar from '@/components/top-bar'

const motorSpeedData = [
  { time: '08:00', rpm: 1240, target: 1200 },
  { time: '08:05', rpm: 1310, target: 1250 },
  { time: '08:10', rpm: 1385, target: 1325 },
  { time: '08:15', rpm: 1460, target: 1400 },
  { time: '08:20', rpm: 1425, target: 1400 },
  { time: '08:25', rpm: 1510, target: 1480 },
]

const currentDrawData = [
  { phase: 'Phase A', current: 12.5 },
  { phase: 'Phase B', current: 14.2 },
  { phase: 'Phase C', current: 13.8 },
]

const performanceData = [
  { attribute: 'Efficiency', motorA: 85, motorB: 78 },
  { attribute: 'Torque', motorA: 12, motorB: 18 },
  { attribute: 'Thermal', motorA: 70, motorB: 95 },
  { attribute: 'Response', motorA: 95, motorB: 82 },
  { attribute: 'Stability', motorA: 88, motorB: 90 },
]

const batteryData = [
  { name: 'Power', used: 640, remaining: 360 }
]

export default function Main() {
  const openSettingsWindow = () => {
    if (window.api) {
      window.api.openNewWindow('settings')
    } else {
      console.warn('Electron API is not available in the browser environment.')
    }
  }

  return (
		<>
		<TopBar/>
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button onClick={openSettingsWindow} className="mt-2">
          Spawn Settings in New Window
</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
		<Link to="/settings">(Press <kbd>d</kbd> to toggle dark mode)</Link>
        </div>
        <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h2 className="text-sm font-medium">Motor speed trend</h2>
            <p className="text-xs text-muted-foreground">
              A reusable line chart example for live telemetry and setpoint tracking.
            </p>
          </div>
          <LineChart
            className="w-full"
            data={motorSpeedData}
            xKey="time"
            series={[
              { dataKey: 'rpm', label: 'Actual RPM' },
              { dataKey: 'target', label: 'Target RPM', dashArray: '6 6' },
            ]}
            tooltipLabelFormatter={(value) => `Time: ${String(value)}`}
          />
        </div>

        <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h2 className="text-sm font-medium">Phase Current</h2>
            <p className="text-xs text-muted-foreground">
              Real-time current distribution across motor phases.
            </p>
          </div>
          <BarChart
            className="w-full h-48"
            data={currentDrawData}
            xKey="phase"
            series={[
              { dataKey: 'current', label: 'Amps (A)', radius: [4, 4, 0, 0] },
            ]}
          />
        </div>

        <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h2 className="text-sm font-medium">Motor Characteristic Comparison</h2>
            <p className="text-xs text-muted-foreground">
              Radar view for efficiency, torque, and thermal benchmarks.
            </p>
          </div>
          <RadarChart
            className="w-full h-64"
            data={performanceData}
            indexKey="attribute"
            series={[
              { dataKey: 'motorA', label: 'Main Motor', fillOpacity: 0.6 },
              { dataKey: 'motorB', label: 'Reference Motor', fillOpacity: 0.4 },
            ]}
          />
        </div>

        <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h2 className="text-sm font-medium">Battery Capacity</h2>
            <p className="text-xs text-muted-foreground">
              Total energy consumption and charge remaining.
            </p>
          </div>
          <RadialChart
            className="h-[150px]"
            data={batteryData}
            centerLabel="Wh remaining"
            centerValue={360}
            series={[
              { dataKey: 'remaining', label: 'Remaining', stackId: 'a', color: 'var(--chart-2)' },
              { dataKey: 'used', label: 'Used', stackId: 'a', color: 'var(--muted)' },
            ]}
            innerRadius={80}
            outerRadius={110}
            startAngle={180}
            endAngle={0}
          />
        </div>
      </div>
    </div>
		</>
  )
}