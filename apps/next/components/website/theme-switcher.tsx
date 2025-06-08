"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify-icon/react";
import { useTheme } from "next-themes";
import { useApplicationState } from "@/states";

export const ThemeSwitcher = () => {
  const [appState, setAppState] = useApplicationState();
  const isDark = appState.theme === "dark";

  // Initialize theme based on system preference or saved state
  useEffect(() => {
    // If no theme is set in appState, check system preference
    if (!appState.theme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setAppState((prev) => ({ ...prev, theme: initialTheme }));

      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    } else {
      // Apply the theme from appState
      if (appState.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [appState.theme, setAppState]);

  const handleToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setAppState((prev) => ({ ...prev, theme: newTheme }));

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Tooltip content={`Switch to ${isDark ? "light" : "dark"} mode`} placement="bottom">
      <div className="flex items-center gap-2">
        <Icon
          icon="solar:sun-2-broken"
          className={`text-default-500 ${!isDark && "text-primary"}`}
          width="20"
          height="20"
        />
        <Switch
          isSelected={isDark}
          onValueChange={handleToggle}
          size="sm"
          color="primary"
          className="mx-1"
        />
        <Icon
          icon="solar:moon-broken"
          className={`text-default-500 ${isDark && "text-primary"}`}
          width="20"
          height="20"
        />
      </div>
    </Tooltip>
  );
};
