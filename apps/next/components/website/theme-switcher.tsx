"use client";

import React, { useEffect, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Laptop, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/button";

const options = [
  { key: "light", label: "Light", icon: <Sun size={20} /> },
  { key: "dark", label: "Dark", icon: <Moon size={20} /> },
  { key: "system", label: "System", icon: <Laptop size={20} /> },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme = "system", setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => opt.key === theme) || options[2];

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="flat"
          radius="full"
          endContent={<ChevronDown size={20} />}
          className="capitalize justify-between"
        >
          {mounted ? selectedOption.icon : <Laptop size={20} />}
          {mounted ? selectedOption.label : "System"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Theme Options"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={mounted ? [theme] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setTheme(selected);
        }}
      >
        {options.map(({ key, label, icon }) => (
          <DropdownItem key={key} startContent={icon}>
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
