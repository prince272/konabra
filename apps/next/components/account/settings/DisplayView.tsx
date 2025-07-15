import React from "react";
import { Sun, Moon, Laptop, ChevronDown, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const themeOptions = [
  { key: "light", label: "Light", icon: <Sun size={20} /> },
  { key: "dark", label: "Dark", icon: <Moon size={20} /> },
  { key: "system", label: "System", icon: <Laptop size={20} /> }
];

const DisplayView = ({ currentView }: BaseViewProps) => {
  const { theme = "system", setTheme } = useTheme();
  const selectedOption = themeOptions.find((opt) => opt.key === theme) || themeOptions[2];

  return (
    <View id="display" currentView={currentView}>
      <div className="space-y-6">
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <h4 className="font-medium">Theme</h4>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span>Appearance</span>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    variant="flat"
                    endContent={<ChevronDown size={20} />}
                    className="w-[140px] justify-between capitalize"
                  >
                    {selectedOption.icon}
                    {selectedOption.label}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Theme Options"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={[theme]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setTheme(selected);
                  }}
                >
                  {themeOptions.map(({ key, label, icon }) => (
                    <DropdownItem key={key} startContent={icon}>
                      {label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </View>
  );
};

export default DisplayView;
