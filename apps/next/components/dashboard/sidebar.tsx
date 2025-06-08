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
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { cn } from "@heroui/theme";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify-icon/react";
import { useAccountState } from "@/states";
import { categoryStore } from "@/states/categories";

interface SidebarProps {
  collapsed?: boolean;
}

interface MenuItemProps {
  title: string;
  path: string;
  icon: string;
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

const MenuItem: React.FC<MenuItemProps> = ({ title, path, icon, children, onItemClick }) => {
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
              ? isChildActive({ title, path, icon, children })
                ? "flat"
                : "light"
              : isActive(path)
                ? "flat"
                : "light"
          }
          isIconOnly
          color={
            hasChildren
              ? isChildActive({ title, path, icon, children })
                ? "primary"
                : "default"
              : isActive(path)
                ? "primary"
                : "default"
          }
          className="mx-auto mb-2"
          onPress={handleItemClick}
        >
          <Icon icon={icon} width="20" height="20" />
        </Button>
      </Tooltip>
    );
  }

  if (hasChildren) {
    const isExpanded =
      expandedMenus[title.toLowerCase()] ?? isChildActive({ title, path, icon, children });
    const isCurrentToggled = currentToggledMenu === title.toLowerCase();
    return (
      <div>
        <Button
          variant={
            isActive(path) || isChildActive({ title, path, icon, children }) ? "flat" : "light"
          }
          radius="full"
          color={
            isActive(path) || isChildActive({ title, path, icon, children }) ? "primary" : "default"
          }
          className="mb-2 w-full justify-start"
          startContent={<Icon icon={icon} width="20" height="20" />}
          endContent={
            <Icon
              icon="solar:alt-arrow-right-linear"
              width="20"
              height="20"
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
      startContent={<Icon icon={icon} width="20" height="20" />}
      onPress={handleItemClick}
    >
      {title}
    </Button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentAccount] = useAccountState();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [currentToggledMenu, setCurrentToggledMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState(categoryStore.get());

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
          // We need to find if this menu is active or has active children.
          // For your case, menus correspond to top-level menu titles in lowercase.

          // Instead of scanning your static menu here, we can do a heuristic by pathname:
          // Keep expanded if pathname starts with /menuKey
          // Or else collapse.

          // To do a more precise check, you'd need a reference to the menu structure.

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

  const handleItemClick = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const unsubscribe = categoryStore.subscribe((newCategories) => {
      setCategories(newCategories);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
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
              icon="solar:home-2-broken"
              onItemClick={handleItemClick}
            />
            <MenuItem
              title="Incidents"
              path="/incidents"
              icon="solar:danger-circle-broken"
              onItemClick={handleItemClick}
            >
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  title={category.name}
                  path={`/incidents/${category.slug}`}
                  icon="solar:tag-broken"
                  onItemClick={handleItemClick}
                />
              ))}
            </MenuItem>
            <MenuItem
              title="Categories"
              path="/categories"
              icon="solar:tag-broken"
              onItemClick={handleItemClick}
            />
            <MenuItem
              title="Map View"
              path="/map-view"
              icon="solar:map-point-wave-broken"
              onItemClick={handleItemClick}
            />
            <MenuItem title="Analytics" path="/analytics" icon="solar:chart-broken">
              <MenuItem
                title="Overview"
                path="/analytics"
                icon="solar:pie-chart-2-broken"
                onItemClick={handleItemClick}
              />
              <MenuItem
                title="Hotspots"
                path="/hotspots"
                icon="solar:fire-broken"
                onItemClick={handleItemClick}
              />
              <MenuItem
                title="Reports"
                path="/reports"
                icon="solar:document-broken"
                onItemClick={handleItemClick}
              />
            </MenuItem>
            <MenuItem title="Management" path="/users" icon="solar:users-group-two-rounded-broken">
              <MenuItem
                title="Users"
                path="/users"
                icon="solar:user-broken"
                onItemClick={handleItemClick}
              />
              <MenuItem
                title="Roles"
                path="/roles"
                icon="solar:shield-user-broken"
                onItemClick={handleItemClick}
              />
            </MenuItem>
            <MenuItem
              title="Help & Support"
              path="/help"
              icon="solar:info-circle-broken"
              onItemClick={handleItemClick}
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
                  as={NextLink}
                  href="#settings"
                  startContent={<Icon icon="solar:settings-linear" width="20" height="20" />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="signout"
                  as={NextLink}
                  href="#signout"
                  startContent={<Icon icon="solar:logout-2-linear" width="20" height="20" />}
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
                startContent={<Icon icon="solar:settings-linear" width="20" height="20" />}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="signout"
                as={NextLink}
                href="#signout"
                startContent={<Icon icon="solar:logout-2-linear" width="20" height="20" />}
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
