import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line"
import TopBar from '@/components/top-bar'

const motorSpeedData = [
  { time: '08:00', rpm: 1240, target: 1200 },
  { time: '08:05', rpm: 1310, target: 1250 },
  { time: '08:10', rpm: 1385, target: 1325 },
  { time: '08:15', rpm: 1460, target: 1400 },
  { time: '08:20', rpm: 1425, target: 1400 },
  { time: '08:25', rpm: 1510, target: 1480 },
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
      </div>
    </div>
		</>
  )
}