import React from "react";
import { NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";

type MenuItem = {
  name: string;
  href: string;
};

type NavbarMenuItemsProps = {
  menuItems: MenuItem[];
  activeItem: string;
};

export const NavbarMenuItems: React.FC<NavbarMenuItemsProps> = ({ menuItems, activeItem }) => (
  <>
    {menuItems.map((item) => (
      <NavbarItem key={item.name} isActive={activeItem === item.name}>
        <Link
          color={activeItem === item.name ? "primary" : "foreground"}
          href={item.href}
          className={`relative text-sm hover:text-primary lg:text-base ${
            activeItem === item.name
              ? "font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-['']"
              : ""
          }`}
        >
          {item.name}
        </Link>
      </NavbarItem>
    ))}
  </>
);
