"use client";

import React, { useEffect } from "react";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify-icon/react";
import { useTheme } from "next-themes";
import { useApplicationState } from "@/states";

export const ThemeSwitcher = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [appState, setAppState] = useApplicationState();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (theme !== appState.theme) {
      setAppState({ ...appState, theme: theme! });
    }
  }, [theme]);

  const handleToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setAppState({ ...appState, theme: newTheme });
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
