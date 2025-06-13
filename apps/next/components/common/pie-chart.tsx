import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { AlertCircle } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { formatNumber } from "@/utils";

interface InsightsPieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
  isLoading?: boolean;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
      <>
        <div
          ref={ref}
          className="relative w-full"
          style={{ ...divProps.style, minHeight: height }}
          {...divProps}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-content1/80">
              <Spinner size="lg" />
            </div>
          )}

          {!hasData && !isLoading ? (
            <div className="text-muted flex h-full flex-col items-center justify-center text-center">
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
                    outerRadius="100%"
                    stroke="none"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
        {/* Legend */}
        <div className="p-4 flex flex-wrap justify-center gap-4">
          {data.map(({ name, color, value }, index) => (
            <div key={`legend-${index}`} className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
              <span className="text-sm text-foreground">
                {name} ({formatNumber(value)})
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }
);

InsightsPieChart.displayName = "InsightsPieChart";

export const pieChartColors = [
  // Blues & Teals
  "#1f77b4", // blue
  "#005ea3", // deep blue
  "#0b486b", // rich navy
  "#2c3e50", // midnight blue
  "#34495e", // wet asphalt
  "#17becf", // bright cyan
  "#00876c", // deep teal
  "#16a085", // green-teal

  // Greens
  "#2ca02c", // vibrant green
  "#27ae60", // emerald
  "#196f3d", // forest green
  "#145a32", // deep jungle
  "#1abc9c", // turquoise
  "#138d75", // dark sea green

  // Reds & Oranges
  "#d62728", // red
  "#c0392b", // dark red-orange
  "#990000", // dark red
  "#8b0000", // crimson
  "#e74c3c", // red coral
  "#e67e22", // carrot orange
  "#f39c12", // golden orange
  "#e55934", // tangerine
  "#ff7f0e", // orange

  // Purples & Pinks
  "#9467bd", // purple
  "#7d3c98", // amethyst
  "#5e4fa2", // indigo
  "#663399", // rebeccapurple
  "#8e44ad", // deep purple
  "#6c3483", // plum
  "#c71585", // medium violet red
  "#e377c2", // pink

  // Yellows & Browns
  "#bcbd22", // olive
  "#b7950b", // gold-brown
  "#6e2c00", // burnt brown
  "#8c564b", // brown
  "#a04000", // rust orange

  // Grays & Neutrals
  "#3b3b3b", // dark gray
  "#1a1a1a", // near-black
  "#2f2f2f", // charcoal
  "#7f7f7f", // medium gray
  "#616a6b", // slate
  "#4d5656", // steel gray
  "#5d6d7e", // bluish gray
  "#212f3d", // navy-gray

  // Bonus Accents
  "#ff1493", // deep pink
  "#db7093", // pale violet red
  "#a93226", // scarlet
  "#ba4a00", // copper
  "#873600", // saddle brown
  "#76448a", // deep mauve
];
