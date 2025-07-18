import React from "react";
import { NavbarBrandSection } from "./NavbarBrandSection";
import { NavbarMenuItems } from "./NavbarMenuItems";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { useNavbarLogic } from "./useNavbarLogic";
import { ThemeSwitcher } from "../theme-switcher";
import {
  Navbar as HeroNavbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu
} from "@heroui/navbar";

export const Navbar = () => {
  const {
    isMenuOpen,
    setIsMenuOpen,
    activeItem,
    menuItems,
    currentAccount
  } = useNavbarLogic();

  return (
    <HeroNavbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      isBordered={false}
      className="z-50 bg-background/50 shadow-sm backdrop-blur-lg dark:bg-background/80 dark:shadow-none"
      maxWidth="xl"
    >
      <NavbarContent className="gap-0">
        <NavbarBrandSection />
      </NavbarContent>
      <NavbarContent className="hidden gap-6 px-6 lg:flex" justify="center">
        <NavbarMenuItems menuItems={menuItems} activeItem={activeItem} />
      </NavbarContent>
      <NavbarContent justify="end" className="gap-4">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          <NavbarUserMenu currentAccount={currentAccount} />
        </NavbarItem>
        <NavbarItem className="ml-2 flex md:hidden">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="p-3" />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu className="bg-background/80 pt-6 backdrop-blur-md dark:bg-background/50">
        <NavbarMobileMenu
          menuItems={menuItems}
          activeItem={activeItem}
          currentAccount={currentAccount}
        />
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar; 