import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { AlertCircle } from "lucide-react";

interface InsightsPieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
  isLoading?: boolean;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const InsightsPieTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <Card className="border border-default bg-background shadow-md" radius="lg">
        <CardBody className="px-3 py-2">
          <div className="font-semibold text-foreground">{item.name}</div>
          <div className="text-sm text-default-500">{item.value}</div>
        </CardBody>
      </Card>
    );
  }
  return null;
};

export const InsightsPieChart = React.forwardRef<HTMLDivElement, InsightsPieChartProps>(
  ({ data, height = 300, isLoading = false, ...divProps }, ref) => {
    const hasData = data && data.length > 0;

    return (
      <div ref={ref} className="relative w-full" style={{ ...divProps.style }} {...divProps}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-content1/80">
            <Spinner size="lg" />
          </div>
        )}

        {!hasData && !isLoading ? (
          <div
            className="flex h-[300px] flex-col items-center justify-center text-center text-muted"
          >
            <AlertCircle className="mb-2 h-8 w-8 text-default-500" />
            <p className="text-sm text-default-500">No data available</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Tooltip content={<InsightsPieTooltip />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  stroke="none"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {data.map(({ name, color }, index) => (
                <div key={`legend-${index}`} className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                  <span className="text-sm text-foreground">{name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
);

InsightsPieChart.displayName = "InsightsPieChart";
