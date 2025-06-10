import React from "react";
import { Card, CardBody, CardProps } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type ColorVariant = "primary" | "secondary" | "success" | "warning" | "danger";

export interface StatCardProps extends CardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isIncrease: boolean;
    isDecrease: boolean;
  };
  icon: React.ReactNode;
  color: ColorVariant;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  isLoading = false,
  className,
  ...cardProps
}) => {
  const bgColorClasses = {
    primary: "bg-primary-50",
    secondary: "bg-secondary-50",
    success: "bg-success-50",
    warning: "bg-warning-50",
    danger: "bg-danger-50"
  };

  const textColorClasses = {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    success: "text-success-500",
    warning: "text-warning-500",
    danger: "text-danger-500"
  };

  return (
    <Card className={cn("w-full", className)} {...cardProps}>
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton isLoaded={!isLoading} className="mb-1 flex h-4 w-32 rounded">
              <p className="truncate text-sm text-default-500">{title}</p>
            </Skeleton>

            <Skeleton isLoaded={!isLoading} className="h-8 w-24 rounded">
              <h3 className="text-2xl font-semibold">{value}</h3>
            </Skeleton>

            <Skeleton isLoaded={!isLoading} className="mt-2 h-4 w-36 rounded">
              <div className="flex min-h-4 items-center">
                {change?.isIncrease || change?.isDecrease ? (
                  <>
                    {change.isIncrease ? (
                      <ArrowUpRight className="mr-1 text-success-500" size={16} />
                    ) : (
                      <ArrowDownRight className="mr-1 text-danger-500" size={16} />
                    )}
                    <span
                      className={cn(
                        "text-xs",
                        change.isIncrease ? "text-success-500" : "text-danger-500"
                      )}
                    >
                      {change.value}% {change.isIncrease ? "increase" : "decrease"}
                    </span>
                  </>
                ) : null}
              </div>
            </Skeleton>
          </div>

          <Skeleton isLoaded={!isLoading} className={cn("rounded-full")}>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                bgColorClasses[color],
                textColorClasses[color]
              )}
            >
              {icon}
            </div>
          </Skeleton>
        </div>
      </CardBody>
    </Card>
  );
};
