"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type FilterOption = {
  readonly key: string;
  readonly label: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
};

type DashboardFilterProps = {
  filters: Record<string, string | undefined>;
  filterOptions: readonly FilterOption[];
  onFilterChange: (key: string, value: string | undefined) => void;
  onReset?: () => void;
};

export const DashboardFilter = ({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
}: DashboardFilterProps) => {
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filterOptions.map((option) => (
            <div key={option.key} className="space-y-2">
              <Label htmlFor={option.key}>{option.label}</Label>
              <Select
                value={filters[option.key] || ""}
                onValueChange={(value) =>
                  onFilterChange(option.key, value === "all" ? undefined : value)
                }
              >
                <SelectTrigger id={option.key}>
                  <SelectValue placeholder={`${option.label} 선택`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {option.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        {hasActiveFilters && onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="sm:w-auto"
            aria-label="모든 필터 초기화"
          >
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            필터 초기화
          </Button>
        )}
      </div>
    </Card>
  );
};

