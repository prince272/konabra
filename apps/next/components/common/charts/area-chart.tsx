import React from "react";
import { Card, CardBody } from "@heroui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import { Spinner } from "@heroui/spinner";

interface InsightsAreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<{ label: string } & { [key: string]: number | string }>;
  areas: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  height?: number;
  isLoading?: boolean;
}

const InsightsAreaTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border border-default bg-background shadow-md" radius="lg">
        <CardBody className="px-3 py-2">
          <div className="mb-1 font-semibold text-foreground">{label}</div>
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="text-sm text-default-500"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  return null;
};

export const InsightsAreaChart = React.forwardRef<HTMLDivElement, InsightsAreaChartProps>(
  ({ data, areas, height, isLoading = false, ...divProps }, ref) => {
    const resolvedHeight = height ?? "100%";

    return (
      <div
        ref={ref}
        className="relative w-full"
        style={{ height: resolvedHeight, ...divProps.style }}
        {...divProps}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-content1/80">
            <Spinner size="lg" />
          </div>
        )}
        <ResponsiveContainer width="100%" height={resolvedHeight}>
          <AreaChart data={data}>
            <CartesianGrid
              stroke="hsl(var(--heroui-divider) / var(--heroui-divider-opacity, var(--tw-bg-opacity)))"
              strokeDasharray="3 3"
            />
            <defs>
              {areas.map(({ key, color }) => (
                <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<InsightsAreaTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingRight: 20, paddingBottom: 20, fontSize: 12 }}
            />
            {areas.map(({ key, label, color }, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stackId={index + 1}
                fill={`url(#color-${key})`}
                stroke={color}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

InsightsAreaChart.displayName = "InsightsAreaChart";
