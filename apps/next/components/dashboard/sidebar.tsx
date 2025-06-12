"use client";

import {
  Children,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { cn } from "@heroui/theme";
import { Tooltip } from "@heroui/tooltip";
import {
  AlertCircle,
  BarChart2,
  ChevronRight,
  FileText,
  Flame,
  HelpCircle,
  Home,
  LogOut,
  Map,
  MapPin,
  Settings,
  Shield,
  Tag,
  TrafficCone,
  User,
  Users
} from "lucide-react";
import { useAccountState } from "@/states";
import { categoryStore } from "@/states/categories";

interface SidebarProps {
  collapsed?: boolean;
  onItemClick?: (path: string) => void;
}

interface MenuItemProps {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  children?: ReactNode;
  onItemClick?: (path: string) => void;
}

interface MenuContextType {
  collapsed: boolean;
  expandedMenus: Record<string, boolean>;
  currentToggledMenu: string | null;
  toggleMenu: (menuTitle: string) => void;
  isActive: (path: string) => boolean;
  isChildActive: (item: MenuItemProps) => boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu components must be used within a Sidebar");
  }
  return context;
};

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  path,
  icon: IconComponent,
  children,
  onItemClick
}) => {
  const { collapsed, expandedMenus, currentToggledMenu, toggleMenu, isActive, isChildActive } =
    useMenuContext();

  const hasChildren = Children.count(children) > 0;

  const handleItemClick = () => {
    if (hasChildren && !collapsed) {
      toggleMenu(title.toLowerCase());
      if (onItemClick) {
        onItemClick(path); // Also navigate when parent clicked
      }
    } else if (onItemClick) {
      onItemClick(path);
    }
  };

  if (collapsed) {
    return (
      <Tooltip content={title} placement="right">
        <Button
          as={hasChildren ? "button" : NextLink}
          href={!hasChildren ? path : undefined}
          variant={
            hasChildren
              ? isChildActive({ title, path, icon: IconComponent, children })
                ? "flat"
                : "light"
              : isActive(path)
                ? "flat"
                : "light"
          }
          isIconOnly
          color={
            hasChildren
              ? isChildActive({ title, path, icon: IconComponent, children })
                ? "primary"
                : "default"
              : isActive(path)
                ? "primary"
                : "default"
          }
          className="mx-auto mb-2"
          onPress={handleItemClick}
        >
          <IconComponent size={20} />
        </Button>
      </Tooltip>
    );
  }

  if (hasChildren) {
    const isExpanded =
      expandedMenus[title.toLowerCase()] ??
      isChildActive({ title, path, icon: IconComponent, children });
    const isCurrentToggled = currentToggledMenu === title.toLowerCase();
    return (
      <div>
        <Button
          variant={
            isActive(path) || isChildActive({ title, path, icon: IconComponent, children })
              ? "flat"
              : "light"
          }
          radius="full"
          color={
            isActive(path) || isChildActive({ title, path, icon: IconComponent, children })
              ? "primary"
              : "default"
          }
          className="mb-2 w-full justify-start"
          startContent={<IconComponent size={20} />}
          endContent={
            <ChevronRight
              size={20}
              className={cn("ml-auto transition-transform", { "rotate-90": isExpanded })}
            />
          }
          onPress={handleItemClick}
        >
          {title}
        </Button>
        <div
          className={cn("overflow-hidden", {
            "transition-max-height duration-500 ease-in-out": isCurrentToggled,
            "": isExpanded,
            "max-h-0": !isExpanded
          })}
        >
          <div className="pl-6">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <Button
      as={NextLink}
      href={path}
      radius="full"
      variant={isActive(path) ? "flat" : "light"}
      color={isActive(path) ? "primary" : "default"}
      className="mb-2 w-full justify-start"
      startContent={<IconComponent size={20} />}
      onPress={handleItemClick}
    >
      {title}
    </Button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onItemClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentAccount] = useAccountState();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [currentToggledMenu, setCurrentToggledMenu] = useState<string | null>(null);

  const toggleMenu = (menuTitle: string) => {
    if (collapsed) return;
    setExpandedMenus((prev) => ({
      ...prev,
      [menuTitle.toLowerCase()]: !prev[menuTitle.toLowerCase()]
    }));
    setCurrentToggledMenu(menuTitle.toLowerCase());
  };

  // Utility function to check if a menu (and its children) contains the active path
  const checkActiveInMenu = (menuTitle: string, children?: ReactNode): boolean => {
    const normalizedTitle = menuTitle.toLowerCase();

    // Check if current pathname starts with menuTitle path segment
    if (pathname.toLowerCase().startsWith(`/${normalizedTitle}`)) return true;

    // Recursively check children paths if available
    let hasActiveChild = false;
    if (children) {
      Children.forEach(children, (child) => {
        if (isValidElement(child)) {
          // Check if child's path matches active path or recursively check its children
          if (pathname === child.props.path) {
            hasActiveChild = true;
          } else if (child.props.children) {
            if (checkActiveInMenu(child.props.title, child.props.children)) {
              hasActiveChild = true;
            }
          }
        }
      });
    }
    return hasActiveChild;
  };

  // On pathname change, collapse menus that are expanded but not active or have no active children
  useEffect(() => {
    setExpandedMenus((prev) => {
      const newExpanded: Record<string, boolean> = {};

      Object.keys(prev).forEach((menuKey) => {
        if (prev[menuKey]) {
          if (pathname.toLowerCase().startsWith(`/${menuKey}`)) {
            newExpanded[menuKey] = true;
          } else {
            newExpanded[menuKey] = false;
          }
        } else {
          newExpanded[menuKey] = false;
        }
      });

      return newExpanded;
    });
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const isChildActive = (item: MenuItemProps) => {
    if (!item.children) return false;

    let hasActiveChild = false;
    Children.forEach(item.children, (child) => {
      if (isValidElement(child) && isActive(child.props.path)) {
        hasActiveChild = true;
      }
    });
    return hasActiveChild;
  };

  const contextValue = {
    collapsed,
    expandedMenus,
    currentToggledMenu,
    toggleMenu,
    isActive,
    isChildActive
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <div
          className={cn("flex items-center", {
            "w-full justify-center": collapsed,
            "gap-2": !collapsed
          })}
        >
          <TrafficCone size={24} className="text-primary" />
          {!collapsed && <span className="text-xl font-bold">Konabra</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav
          className={cn("flex flex-col justify-center", {
            "px-1": collapsed,
            "px-2": !collapsed
          })}
        >
          <MenuContext.Provider value={contextValue}>
            <MenuItem
              title="Dashboard"
              path="/dashboard"
              icon={Home}
              onItemClick={onItemClick}
            />
            <MenuItem
              title="Incidents"
              path="/incidents"
              icon={AlertCircle}
              onItemClick={onItemClick}
            />
            <MenuItem
              title="Categories"
              path="/categories"
              icon={Tag}
              onItemClick={onItemClick}
            />
            <MenuItem title="Map View" path="/map-view" icon={Map} onItemClick={onItemClick} />
            <MenuItem title="Analytics" path="/analytics" icon={BarChart2}>
              <MenuItem
                title="Overview"
                path="/analytics"
                icon={BarChart2}
                onItemClick={onItemClick}
              />
              <MenuItem
                title="Hotspots"
                path="/hotspots"
                icon={Flame}
                onItemClick={onItemClick}
              />
              <MenuItem
                title="Reports"
                path="/reports"
                icon={FileText}
                onItemClick={onItemClick}
              />
            </MenuItem>
            <MenuItem title="Management" path="/users" icon={Users}>
              <MenuItem title="Users" path="/users" icon={User} onItemClick={onItemClick} />
              <MenuItem title="Roles" path="/roles" icon={Shield} onItemClick={onItemClick} />
            </MenuItem>
            <MenuItem
              title="Help & Support"
              path="/help"
              icon={HelpCircle}
              onItemClick={onItemClick}
            />
          </MenuContext.Provider>
        </nav>
      </div>

      <div
        className={cn("space-1 flex flex-col justify-center py-4", {
          "px-1": collapsed,
          "px-2": !collapsed
        })}
      >
        {collapsed ? (
          <Tooltip content="John Doe - Administrator" placement="right">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light" size="lg" isIconOnly>
                  <Avatar size="sm" name={currentAccount?.fullName} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="settings"
                  startContent={<Settings size={20} />}
                  onPress={() => onItemClick?.("#settings")}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="signout"
                  onPress={() => onItemClick?.("#signout")}
                  startContent={<LogOut size={20} />}
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
                  <p className="text-xs text-foreground-500">{currentAccount?.primaryRole}</p>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem
                key="settings"
                as={NextLink}
                href="#settings"
                startContent={<Settings size={20} />}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="signout"
                as={NextLink}
                href="#signout"
                startContent={<LogOut size={20} />}
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
