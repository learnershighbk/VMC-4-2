"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { type KPIData } from "@/features/dashboard/lib/dto";
import { cn } from "@/lib/utils";

type KPICardProps = {
  data: KPIData;
  className?: string;
};

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  stable: "text-gray-500",
};

export const KPICard = ({ data, className }: KPICardProps) => {
  const TrendIcon = trendIcons[data.trend];
  const trendColor = trendColors[data.trend];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
        <TrendIcon className={cn("h-4 w-4", trendColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {data.value.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {data.unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

