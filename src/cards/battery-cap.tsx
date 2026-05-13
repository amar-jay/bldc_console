
import { RadialChart } from "@/components/charts/radial"
const batteryData = [
  { name: 'Power', used: 640, remaining: 360 }
]
export default function BatteryCapCard() {
	return (
        <div className="size-full flex flex-col rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 space-y-1 shrink-0">
            <h2 className="text-sm font-medium">Battery Capacity</h2>
            <p className="text-xs text-muted-foreground">
              Total energy consumption and charge remaining.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <RadialChart
              className="aspect-auto min-h-[200px]"
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
	);
}