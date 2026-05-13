import * as React from "react"
import {
	CartesianGrid,
	Line,
	LineChart as RechartsLineChart,
	XAxis,
	YAxis,
} from "recharts"

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const DEFAULT_LINE_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const

export type LineChartSeries = {
	dataKey: string
	label?: React.ReactNode
	color?: string
	strokeWidth?: number
	type?: "linear" | "monotone" | "natural" | "step"
	dot?: boolean
	connectNulls?: boolean
	dashArray?: string
}

export type LineChartProps<TData extends Record<string, unknown>> =
	React.ComponentProps<"div"> & {
		data: TData[]
		xKey: keyof TData & string
		series: LineChartSeries[]
		showLegend?: boolean
		showGrid?: boolean
		showTooltip?: boolean
		yAxisWidth?: number
		xTickFormatter?: (value: unknown) => string
		yTickFormatter?: (value: unknown) => string
		tooltipLabelFormatter?: (label: unknown) => React.ReactNode
	}

function LineChart<TData extends Record<string, unknown>>({
	data,
	xKey,
	series,
	className,
	showLegend = true,
	showGrid = true,
	showTooltip = true,
	yAxisWidth = 44,
	xTickFormatter,
	yTickFormatter,
	tooltipLabelFormatter,
	...props
}: LineChartProps<TData>) {
	const config = React.useMemo<ChartConfig>(() => {
		return series.reduce<ChartConfig>((accumulator, item, index) => {
			const color =
				item.color ?? DEFAULT_LINE_COLORS[index % DEFAULT_LINE_COLORS.length]

			accumulator[item.dataKey] = {
				label: item.label ?? item.dataKey,
				color,
			}

			return accumulator
		}, {})
	}, [series])

	const formatTooltipLabel = React.useCallback(
		(value: unknown) => {
			if (tooltipLabelFormatter) {
				return tooltipLabelFormatter(value)
			}

			if (typeof value === "string" || typeof value === "number") {
				return value
			}

			return null
		},
		[tooltipLabelFormatter]
	)

	return (
		<ChartContainer config={config} className={cn("h-80 aspect-auto", className)} {...props}>
			<RechartsLineChart
				data={data}
				margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
			>
				{showGrid ? (
					<CartesianGrid vertical={false} strokeDasharray="3 3" />
				) : null}
				<XAxis
					dataKey={xKey as string}
					axisLine={false}
					tickLine={false}
					tickMargin={10}
					tickFormatter={xTickFormatter}
					minTickGap={24}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tickMargin={10}
					width={yAxisWidth}
					tickFormatter={yTickFormatter}
				/>
				{showTooltip ? (
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={formatTooltipLabel}
								indicator="line"
							/>
						}
					/>
				) : null}
				{series.map((item, index) => {
					const color =
						item.color ?? DEFAULT_LINE_COLORS[index % DEFAULT_LINE_COLORS.length]

					return (
						<Line
							key={item.dataKey}
							dataKey={item.dataKey}
							type={item.type ?? "monotone"}
							stroke={color}
							strokeWidth={item.strokeWidth ?? 2}
							strokeDasharray={item.dashArray}
							dot={item.dot ?? false}
							connectNulls={item.connectNulls ?? true}
							activeDot={{ r: 4 }}
						/>
					)
				})}
				{showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
			</RechartsLineChart>
		</ChartContainer>
	)
}

export { LineChart }
