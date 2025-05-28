"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify-icon/react";
import { useTheme } from "next-themes";

export const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme based on system preference or localStorage
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const handleToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
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
