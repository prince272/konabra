"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { RangeCalendar } from "@heroui/calendar";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { CalendarDate, getLocalTimeZone, isSameDay, now, today } from "@internationalized/date";
import {
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Folder,
  Users
} from "lucide-react";
import { calendarDateToISOString } from "@/utils";
import { categoryService, identityService, incidentService } from "@/services";
import { CategoryStatistics } from "@/services/category-service";
import { UserStatistics } from "@/services/identity-service";
import { IncidentFilter, IncidentStatistics } from "@/services/incident-service";
import { StatCard } from "./stats-card";

export const DashboardPage: React.FC = () => {
  const [filter, setFilter] = useState<Partial<{ startDate: string; endDate: string }>>({
    startDate: calendarDateToISOString(today(getLocalTimeZone())),
    endDate: calendarDateToISOString(today(getLocalTimeZone()), true)
  });

  const [stats, setStats] = useState<IncidentStatistics | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatistics | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);

  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [selectedRange, setSelectedRange] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone())
  });

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("today");

  // Fetch Incident Statistics
  useEffect(() => {
    const fetchIncidentStats = async () => {
      setIsLoadingIncidents(true);
      const [data, problem] = await incidentService.getIncidentsStatistics(filter);
      if (!problem) setStats(data);
      else console.error("Incident stats error:", problem);
      setIsLoadingIncidents(false);
    };
    fetchIncidentStats();
  }, [filter]);

  // Fetch Category Statistics
  useEffect(() => {
    const fetchCategoryStats = async () => {
      setIsLoadingCategories(true);
      const [data, problem] = await categoryService.getCategoriesStatistics(filter);
      if (!problem) setCategoryStats(data);
      else console.error("Category stats error:", problem);
      setIsLoadingCategories(false);
    };
    fetchCategoryStats();
  }, [filter]);

  // Fetch User Statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoadingUsers(true);
      const [data, problem] = await identityService.getUsersStatistics(filter);
      if (!problem) setUserStats(data);
      else console.error("User stats error:", problem);
      setIsLoadingUsers(false);
    };
    fetchUserStats();
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
      case "thisWeek":
        start = now.subtract({ days: (now.day - 1) % 7 });
        end = start.add({ days: 6 });
        break;
      case "lastWeek":
        start = now.subtract({ days: ((now.day - 1) % 7) + 7 });
        end = start.add({ days: 6 });
        break;
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
                  <Button size="sm" startContent={<CalendarIcon size={20} />}>
                    {formatDateRange()}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Date Range Filter"
                  selectedKeys={[selectedPreset]}
                  selectionMode="single"
                >
                  {[
                    "today",
                    "thisWeek",
                    "lastWeek",
                    "thisMonth",
                    "lastMonth",
                    "last3Months",
                    "thisYear",
                    "lastYear",
                    "custom"
                  ].map((key) => (
                    <DropdownItem
                      key={key}
                      onPress={() =>
                        key === "custom" ? setShowCustomRange(true) : applyPresetRange(key)
                      }
                    >
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </DropdownItem>
                  ))}
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
              <Button variant="flat" onPress={() => applyPresetRange("today")}>
                Reset
              </Button>
              <Button color="primary" onPress={applyDateRange}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
          isLoading={isLoadingIncidents}
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
          icon={<CheckCircle />}
          isLoading={isLoadingIncidents}
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
          icon={<AlertCircle />}
          isLoading={isLoadingIncidents}
          color="danger"
        />
        <StatCard
          shadow="none"
          title="Total Categories"
          value={categoryStats?.totalCategories?.newCount ?? 0}
          change={
            categoryStats
              ? {
                  value: categoryStats.totalCategories.percentChange.toFixed(1),
                  isIncrease: categoryStats.totalCategories.isIncrease,
                  isDecrease: categoryStats.totalCategories.isDecrease
                }
              : undefined
          }
          icon={<Folder />}
          isLoading={isLoadingCategories}
          color="warning"
        />
        <StatCard
          shadow="none"
          title="Total Users"
          value={userStats?.totalUsers?.newCount ?? 0}
          change={
            userStats
              ? {
                  value: userStats.totalUsers.percentChange.toFixed(1),
                  isIncrease: userStats.totalUsers.isIncrease,
                  isDecrease: userStats.totalUsers.isDecrease
                }
              : undefined
          }
          icon={<Users />}
          isLoading={isLoadingUsers}
          color="secondary"
        />
      </div>
    </div>
  );
};
