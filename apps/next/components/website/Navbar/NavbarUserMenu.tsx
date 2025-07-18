import React from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { LayoutDashboard, Settings, LogOut, User } from "lucide-react";

type CurrentAccount = {
  firstName: string;
};

type NavbarUserMenuProps = {
  currentAccount: CurrentAccount | null;
};

export const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({ currentAccount }) => {
  return currentAccount ? (
    <Dropdown>
      <DropdownTrigger>
        <Button radius="full" color="primary" variant="solid" className="px-4">
          {currentAccount.firstName}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem
          key="dashboard"
          as={NextLink}
          href="/dashboard"
          startContent={<LayoutDashboard size={20} />}
        >
          Dashboard
        </DropdownItem>
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
  ) : (
    <Button
      radius="full"
      as={NextLink}
      color="primary"
      variant="solid"
      className="px-4"
      href="#signin"
      startContent={<User size={20} />}
    >
      Sign In
    </Button>
  );
}; 