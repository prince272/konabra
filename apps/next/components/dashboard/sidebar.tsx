import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { cn } from "@heroui/theme";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify-icon/react";
import { useAccountState } from "@/states";
import { useHashState } from "@/hooks";

interface SidebarProps {
  onItemClick?: () => void;
  collapsed?: boolean;
}

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, collapsed = false }) => {
  const pathname = usePathname();
  const [hash] = useHashState();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [currentAccount] = useAccountState();

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: "solar:home-2-linear"
    },
    {
      title: "Incidents",
      path: "/incidents",
      icon: "solar:danger-triangle-linear",
      children: [
        {
          title: "All Incidents",
          path: "/incidents",
          icon: "solar:list-linear"
        },
        {
          title: "Accidents",
          path: "/incidents/accidents",
          icon: "solar:car-crash-linear"
        },
        {
          title: "Traffic Jams",
          path: "/incidents/traffic",
          icon: "solar:traffic-linear"
        },
        {
          title: "Road Issues",
          path: "/incidents/road-issues",
          icon: "solar:hammer-linear"
        }
      ]
    },
    {
      title: "Map View",
      path: "/map-view",
      icon: "solar:map-point-wave-linear"
    },
    {
      title: "Analytics",
      path: "/analytics",
      icon: "solar:chart-linear",
      children: [
        {
          title: "Overview",
          path: "/analytics",
          icon: "solar:pie-chart-2-linear"
        },
        {
          title: "Hotspots",
          path: "/hotspots",
          icon: "solar:map-arrow-wave-linear"
        },
        {
          title: "Reports",
          path: "/reports",
          icon: "solar:document-linear"
        }
      ]
    },
    {
      title: "Management",
      path: "/users",
      icon: "solar:users-group-two-rounded-linear",
      children: [
        {
          title: "Users",
          path: "/users",
          icon: "solar:user-linear"
        },
        {
          title: "Authorities",
          path: "/authorities",
          icon: "solar:shield-user-linear"
        },
        {
          title: "Emergency Services",
          path: "/emergency-services",
          icon: "solar:ambulance-linear"
        }
      ]
    },
    {
      title: "Notifications",
      path: "/notifications",
      icon: "solar:bell-linear"
    },
    {
      title: "Help & Support",
      path: "/help",
      icon: "solar:info-circle-linear"
    }
  ];

  const toggleMenu = (menuTitle: string) => {
    if (collapsed) return;
    setExpandedMenus((prev) => ({
      ...prev,
      [menuTitle.toLowerCase()]: !prev[menuTitle.toLowerCase()]
    }));
  };

  const isActive = (path: string) => pathname === path;
  const isChildActive = (item: MenuItem) =>
    item.children?.some((child) => pathname.startsWith(child.path)) || false;

  const handleItemClick = (item: MenuItem) => {
    if (item.children && !collapsed) {
      toggleMenu(item.title.toLowerCase());
    } else if (onItemClick) {
      onItemClick();
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (collapsed) {
      return (
        <Tooltip content={item.title} placement="right">
          <Button
            as={item.children ? "button" : NextLink}
            href={!item.children ? item.path : undefined}
            variant={
              item.children
                ? isChildActive(item)
                  ? "flat"
                  : "light"
                : isActive(item.path)
                  ? "flat"
                  : "light"
            }
            isIconOnly
            color={
              item.children
                ? isChildActive(item)
                  ? "primary"
                  : "default"
                : isActive(item.path)
                  ? "primary"
                  : "default"
            }
            className="mx-auto mb-2"
            onPress={() => handleItemClick(item)}
          >
            <Icon icon={item.icon} className="text-xl" />
          </Button>
        </Tooltip>
      );
    }

    if (item.children) {
      const isExpanded = expandedMenus[item.title.toLowerCase()] ?? isChildActive(item);
      return (
        <div>
          <Button
            variant="light"
            color={isChildActive(item) ? "primary" : "default"}
            className="mb-1 w-full justify-start"
            startContent={<Icon icon={item.icon} className="text-xl" />}
            endContent={
              <Icon
                icon="solar:alt-arrow-right-linear"
                className={cn("ml-auto text-lg transition-transform", { "rotate-90": isExpanded })}
              />
            }
            onPress={() => handleItemClick(item)}
          >
            {item.title}
          </Button>
          <div
            className={cn("overflow-hidden transition-all", {
              "max-h-96": isExpanded,
              "max-h-0": !isExpanded
            })}
          >
            <div className="pl-6">
              {item.children.map((child) => (
                <Button
                  key={child.title}
                  as={NextLink}
                  href={child.path}
                  variant="light"
                  color={isActive(child.path) ? "primary" : "default"}
                  className="mb-1 w-full justify-start"
                  startContent={<Icon icon={child.icon} className="text-lg" />}
                  size="sm"
                  onPress={() => onItemClick?.()}
                >
                  {child.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Button
        as={NextLink}
        href={item.path}
        variant={isActive(item.path) ? "flat" : "light"}
        color={isActive(item.path) ? "primary" : "default"}
        className="mb-1 w-full justify-start"
        startContent={<Icon icon={item.icon} className="text-xl" />}
        onPress={() => handleItemClick(item)}
      >
        {item.title}
      </Button>
    );
  };

  return (
    <div className="flex h-full flex-col bg-content1">
      <div className="flex h-16 items-center bg-content2 px-4">
        <div
          className={cn("flex items-center", {
            "w-full justify-center": collapsed,
            "gap-2": !collapsed
          })}
        >
          <Icon icon="solar:traffic-linear" className="text-2xl text-primary" />
          {!collapsed && <span className="text-xl font-bold">Konabra</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className={cn("space-y-1", { "px-1": collapsed, "px-2": !collapsed })}>
          {menuItems.map((item) => (
            <div key={item.title} className="mb-1">
              {renderMenuItem(item)}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4">
        {collapsed ? (
          <Tooltip content="John Doe - Administrator" placement="right">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light" size="lg" className="w-full justify-start px-2" isIconOnly>
                  <Avatar size="sm" name={currentAccount?.fullName} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="settings"
                  as={NextLink}
                  href="#settings"
                  startContent={<Icon icon="solar:settings-linear" width={20} height={20} />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="signout"
                  as={NextLink}
                  href="#signout"
                  startContent={<Icon icon="solar:logout-2-linear" width={20} height={20} />}
                  color="primary"
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Tooltip>
        ) : (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="light"
                size="lg"
                className="w-full justify-start px-2"
                startContent={<Avatar size="sm" name={currentAccount?.fullName} />}
              >
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium">{currentAccount?.fullName}</p>
                  <p className="text-xs text-foreground-500">Administrator</p>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem
                key="settings"
                as={NextLink}
                href="#settings"
                startContent={<Icon icon="solar:settings-linear" width={20} height={20} />}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="signout"
                as={NextLink}
                href="#signout"
                startContent={<Icon icon="solar:logout-2-linear" width={20} height={20} />}
                color="primary"
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </div>
  );
};