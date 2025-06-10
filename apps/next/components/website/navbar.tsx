"use client";

import React from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Link } from "@heroui/link";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle
} from "@heroui/navbar";
import {
  BarChart2,
  Home,
  Info,
  LayoutDashboard,
  ListPlus,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  Sun,
  User
} from "lucide-react";
import { useAccountState } from "@/states";
import { ThemeSwitcher } from "./theme-switcher";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState("Home");
  const [currentAccount] = useAccountState();

  const menuItems = [
    { name: "Home", href: "#" },
    { name: "Impact", href: "#stats" },
    { name: "Features", href: "#features" },
    { name: "Alerts", href: "#alerts" },
    { name: "Incidents", href: "#incidents-map" },
    { name: "Contact", href: "#contact" }
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      // Fix for Home section detection
      if (window.scrollY < 100) {
        setActiveItem("Home");
        return;
      }

      const sections = menuItems.map((item) =>
        item.href !== "#" ? document.querySelector(item.href) : document.querySelector("header")
      );

      const scrollPosition = window.scrollY + 100;

      sections.forEach((section, index) => {
        if (!section) return;

        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveItem(menuItems[index].name);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <HeroNavbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      isBordered={false}
      className="z-50 bg-background/50 shadow-sm backdrop-blur-lg dark:bg-background/80 dark:shadow-none"
      maxWidth="xl"
    >
      <NavbarContent className="gap-0">
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-primary to-primary-600 p-1">
              <MapPin size={20} className="text-success" />
            </div>
            <p className="font-montserrat text-xl font-bold text-inherit">Konabra</p>
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-6 px-6 lg:flex" justify="center">
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
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          {currentAccount ? (
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
          )}
        </NavbarItem>
        <NavbarItem className="ml-2 flex md:hidden">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="p-3" />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-background/80 pt-6 backdrop-blur-md dark:bg-background/50">
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
                as={NextLink}
                href="#settings"
                size="lg"
              >
                <div className="flex items-center gap-3 px-4">
                  <Settings size={20} className="text-primary" />
                  Settings
                </div>
              </Link>
              <Link color="primary" className="w-full py-3" as={NextLink} href="#signout" size="lg">
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
      </NavbarMenu>
    </HeroNavbar>
  );
};

// Helper function to get icons for mobile menu
function getMenuIcon(name: string) {
  switch (name) {
    case "Home":
      return <Home size={20} className="text-primary" />;
    case "Features":
      return <ListPlus size={20} className="text-primary" />;
    case "Impact":
      return <BarChart2 size={20} className="text-primary" />;
    case "Alerts":
      return <Info size={20} className="text-primary" />;
    case "Incidents":
      return <MapPin size={20} className="text-primary" />;
    case "Contact":
      return <MessageCircle size={20} className="text-primary" />;
    default:
      return <Menu size={20} className="text-primary" />;
  }
}
