import React from "react";
import { Link } from "@heroui/link";
import { NavbarMenuItem } from "@heroui/navbar";
import { Settings, LogOut, User, Sun } from "lucide-react";
import { ThemeSwitcher } from "../theme-switcher";
import { getMenuIcon } from "./getMenuIcon";

type MenuItem = {
  name: string;
  href: string;
};

type CurrentAccount = {
  firstName: string;
};

type NavbarMobileMenuProps = {
  menuItems: MenuItem[];
  activeItem: string;
  currentAccount: CurrentAccount | null;
};

export const NavbarMobileMenu: React.FC<NavbarMobileMenuProps> = ({ menuItems, activeItem, currentAccount }) => (
  <>
    {menuItems.map((item, index) => (
      <NavbarMenuItem key={`${item.name}-${index}`}>
        <Link
          color={activeItem === item.name ? "primary" : "foreground"}
          className={`w-full py-3 ${activeItem === item.name ? "font-medium" : ""}`}
          href={item.href}
          size="lg"
        >
          <div className="flex items-center gap-3 px-4">
            {getMenuIcon(item.name)}
            {item.name}
          </div>
        </Link>
      </NavbarMenuItem>
    ))}
    <NavbarMenuItem>
      {currentAccount ? (
        <>
          <Link
            color="primary"
            className="w-full py-3"
            as={undefined}
            href="#settings"
            size="lg"
          >
            <div className="flex items-center gap-3 px-4">
              <Settings size={20} className="text-primary" />
              Settings
            </div>
          </Link>
          <Link color="primary" className="w-full py-3" as={undefined} href="#signout" size="lg">
            <div className="flex items-center gap-3 px-4">
              <LogOut size={20} className="text-primary" />
              Sign Out
            </div>
          </Link>
        </>
      ) : (
        <Link color="foreground" className="w-full py-3" href="#signin" size="lg">
          <div className="flex items-center gap-3 px-4">
            <User size={20} className="text-primary" />
            Sign In
          </div>
        </Link>
      )}
    </NavbarMenuItem>
    <NavbarMenuItem>
      <div className="flex items-center gap-3 px-4 py-3">
        <Sun size={20} className="text-primary" />
        <span>Theme</span>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </NavbarMenuItem>
  </>
);
