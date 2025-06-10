"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { RangeCalendar } from "@heroui/calendar";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { CalendarDate, getLocalTimeZone, isSameDay, now, today } from "@internationalized/date";
import { AlertCircle, AlertTriangle, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { incidentService } from "@/services";
import { IncidentFilter, IncidentStatistics } from "@/services/incident-service";
import { StatCard } from "./stats-card";
import { calendarDateToISOString } from "@/utils";

export const DashboardPage: React.FC = () => {
  const [filter, setFilter] = useState<Partial<IncidentFilter>>({
    startDate: calendarDateToISOString(today(getLocalTimeZone())),
    endDate: calendarDateToISOString(today(getLocalTimeZone()), true)
  });

  const [stats, setStats] = useState<IncidentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone())
  });

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("today");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const [data, problem] = await incidentService.getIncidentsStatistics(filter);
      if (!problem) {
        setStats(data);
      } else {
        console.error("Failed to load incident stats:", problem);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [filter]);

  const handleDateRangeChange = (value: { start: CalendarDate; end: CalendarDate }) => {
    setSelectedRange(value);
  };

  const applyDateRange = () => {
    setSelectedPreset("custom");
    setFilter({
      startDate: calendarDateToISOString(selectedRange.start),
      endDate: calendarDateToISOString(selectedRange.end, true)
    });
    setShowCustomRange(false);
  };

  const applyPresetRange = (preset: string) => {
    setSelectedPreset(preset);
    setShowCustomRange(false);

    const now = today(getLocalTimeZone());
    let start = now;
    let end = now;

    switch (preset) {
      case "today":
        break;
      case "thisWeek": {
        const firstDayOfWeek = now.subtract({ days: (now.day - 1) % 7 });
        start = firstDayOfWeek;
        end = firstDayOfWeek.add({ days: 6 });
        break;
      }
      case "lastWeek": {
        const firstDayOfLastWeek = now.subtract({ days: ((now.day - 1) % 7) + 7 });
        start = firstDayOfLastWeek;
        end = firstDayOfLastWeek.add({ days: 6 });
        break;
      }
      case "thisMonth":
        start = now.set({ day: 1 });
        end = start.add({ months: 1 }).subtract({ days: 1 });
        break;
      case "lastMonth":
        start = now.subtract({ months: 1 }).set({ day: 1 });
        end = start.add({ months: 1 }).subtract({ days: 1 });
        break;
      case "last3Months":
        start = now.subtract({ months: 2 }).set({ day: 1 });
        end = now;
        break;
      case "thisYear":
        start = now.set({ month: 1, day: 1 });
        end = now.set({ month: 12, day: 31 });
        break;
      case "lastYear":
        start = now.subtract({ years: 1 }).set({ month: 1, day: 1 });
        end = start.set({ month: 12, day: 31 });
        break;
    }

    setSelectedRange({ start, end });
    setFilter({
      startDate: calendarDateToISOString(start),
      endDate: calendarDateToISOString(end, true)
    });
  };

  const formatDateRange = () => {
    if (selectedPreset === "custom") {
      if (!filter.startDate || !filter.endDate) return "Select Date Range";

      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);

      return isSameDay(selectedRange.start, selectedRange.end)
        ? start.toLocaleDateString()
        : `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }

    const labels: Record<string, string> = {
      today: "Today",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      last3Months: "Last 3 Months",
      thisYear: "This Year",
      lastYear: "Last Year"
    };

    return labels[selectedPreset] || "Select Date Range";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Popover isOpen={showCustomRange} onOpenChange={setShowCustomRange}>
          <PopoverTrigger>
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" startContent={<CalendarIcon size={20} />}>{formatDateRange()}</Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Date Range Filter"
                  selectedKeys={[selectedPreset]}
                  selectionMode="single"
                  disallowEmptySelection
                >
                  <DropdownItem key="today" onPress={() => applyPresetRange("today")}>
                    Today
                  </DropdownItem>
                  <DropdownItem key="thisWeek" onPress={() => applyPresetRange("thisWeek")}>
                    This Week
                  </DropdownItem>
                  <DropdownItem key="lastWeek" onPress={() => applyPresetRange("lastWeek")}>
                    Last Week
                  </DropdownItem>
                  <DropdownItem key="thisMonth" onPress={() => applyPresetRange("thisMonth")}>
                    This Month
                  </DropdownItem>
                  <DropdownItem key="lastMonth" onPress={() => applyPresetRange("lastMonth")}>
                    Last Month
                  </DropdownItem>
                  <DropdownItem key="last3Months" onPress={() => applyPresetRange("last3Months")}>
                    Last 3 Months
                  </DropdownItem>
                  <DropdownItem key="thisYear" onPress={() => applyPresetRange("thisYear")}>
                    This Year
                  </DropdownItem>
                  <DropdownItem key="lastYear" onPress={() => applyPresetRange("lastYear")}>
                    Last Year
                  </DropdownItem>
                  <DropdownItem key="custom" onPress={() => setShowCustomRange(true)}>
                    Custom Range
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <RangeCalendar
              aria-label="Custom date range"
              value={selectedRange}
              onChange={handleDateRangeChange}
              minValue={today(getLocalTimeZone()).subtract({ years: 10 })}
              maxValue={today(getLocalTimeZone())}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="flat"
                onPress={() => {
                  const resetDate = today(getLocalTimeZone());
                  setSelectedRange({ start: resetDate, end: resetDate });
                  applyPresetRange("today");
                }}
              >
                Reset
              </Button>
              <Button color="primary" onPress={applyDateRange}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          shadow="none"
          title="Total Incidents"
          value={stats?.totalIncidents?.newCount ?? 0}
          change={
            stats
              ? {
                  value: stats.totalIncidents.percentChange.toFixed(1),
                  isIncrease: stats.totalIncidents.isIncrease,
                  isDecrease: stats.totalIncidents.isDecrease
                }
              : undefined
          }
          icon={<AlertTriangle />}
          isLoading={isLoading}
          color="primary"
        />
        <StatCard
          shadow="none"
          title="Resolved Incidents"
          value={stats?.resolvedIncidents?.newCount ?? 0}
          change={
            stats
              ? {
                  value: stats.resolvedIncidents.percentChange.toFixed(1),
                  isIncrease: stats.resolvedIncidents.isIncrease,
                  isDecrease: stats.resolvedIncidents.isDecrease
                }
              : undefined
          }
          icon={<CheckCircle size={20} />}
          isLoading={isLoading}
          color="success"
        />
        <StatCard
          shadow="none"
          title="Unresolved Incidents"
          value={stats?.unresolvedIncidents?.newCount ?? 0}
          change={
            stats
              ? {
                  value: stats.unresolvedIncidents.percentChange.toFixed(1),
                  isIncrease: stats.unresolvedIncidents.isIncrease,
                  isDecrease: stats.unresolvedIncidents.isDecrease
                }
              : undefined
          }
          icon={<AlertCircle size={20} />}
          isLoading={isLoading}
          color="danger"
        />
      </div>
    </div>
  );
};
