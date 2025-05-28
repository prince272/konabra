"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/drawer";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify-icon/react";
import { stringifyPath } from "@/utils";
import { useAccountState } from "@/states";
import { useBreakpoint, useHashState } from "@/hooks";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isSmallScreen = useBreakpoint("sm", "down");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [currentAccount] = useAccountState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash] = useHashState();
  const hasRedirected = useRef(false);

  const returnUrl = useMemo(() => {
    const url = stringifyPath(
      {
        url: pathname,
        query: Object.fromEntries(searchParams.entries()),
        fragmentIdentifier: !["signin", "signout"].includes(hash) ? hash : undefined
      },
      { skipNull: true }
    );
    return url;
  }, [hasRedirected]);

  useEffect(() => {
    if (!currentAccount && !hasRedirected.current) {
      hasRedirected.current = true;

      const signinUrl = stringifyPath(
        {
          url: "/",
          query: { returnUrl },
          fragmentIdentifier: "signin"
        },
        { skipNull: true }
      );

      router.replace(signinUrl);
    }
  }, [currentAccount, returnUrl]);

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      {!isSmallScreen && (
        <div
          className={`${isSidebarCollapsed ? "w-16" : "w-64"} h-screen flex-shrink-0 transition-all duration-300`}
        >
          <Sidebar collapsed={isSidebarCollapsed} />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {isSmallScreen && (
        <Drawer isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} placement="left">
          <DrawerContent>
            <DrawerHeader className="px-0 py-0">
              <div className="flex h-16 items-center bg-content2 px-4">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:traffic-cone-broken" className="text-2xl text-primary" />
                  <span className="text-xl font-bold">Konabra</span>
                </div>
              </div>
            </DrawerHeader>
            <DrawerBody className="p-0">
              <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Main content */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <Navbar maxWidth="full" className="bg-content1 shadow-sm">
          <NavbarContent justify="start">
            {isSmallScreen ? (
              <NavbarItem>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setIsSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Icon icon="solar:hamburger-menu-broken" className="text-xl" />
                </Button>
              </NavbarItem>
            ) : (
              <NavbarItem>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <Icon
                    icon={
                      isSidebarCollapsed
                        ? "solar:sidebar-arrow-right-broken"
                        : "solar:sidebar-arrow-left-broken"
                    }
                    className="text-xl"
                  />
                </Button>
              </NavbarItem>
            )}
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <div className="flex items-center gap-2">
                <Tooltip content="Search">
                  <Button isIconOnly variant="light" aria-label="Search">
                    <Icon icon="solar:magnifer-broken" className="text-xl" />
                  </Button>
                </Tooltip>

                <Tooltip content="Notifications">
                  <Button
                    isIconOnly
                    variant="light"
                    aria-label="Notifications"
                    onPress={() => setIsNotificationsOpen(true)}
                  >
                    <div className="relative">
                      <Icon icon="solar:bell-broken" className="text-xl" />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                        3
                      </span>
                    </div>
                  </Button>
                </Tooltip>

                <Tooltip content="Profile">
                  <Button isIconOnly variant="light" className="rounded-full" aria-label="Profile">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                  </Button>
                </Tooltip>
              </div>
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        {/* Notifications drawer */}
        <Drawer
          isOpen={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}
          placement="right"
        >
          <DrawerContent>
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setIsNotificationsOpen(false)}
                >
                  <Icon icon="solar:close-circle-broken" className="text-xl" />
                </Button>
              </div>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-4">
                <div className="rounded-medium bg-content2 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900">
                      <Icon icon="solar:danger-triangle-broken" className="text-lg text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">New accident reported</p>
                      <p className="text-small text-foreground-500">
                        Accident at Accra-Tema Motorway
                      </p>
                      <p className="mt-1 text-tiny text-foreground-400">10 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-medium bg-content2 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-warning-100 p-2 dark:bg-warning-900">
                      <Icon icon="solar:traffic-cone-broken" className="text-lg text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">Traffic jam alert</p>
                      <p className="text-small text-foreground-500">
                        Heavy traffic at Kwame Nkrumah Circle
                      </p>
                      <p className="mt-1 text-tiny text-foreground-400">25 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-medium bg-content2 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-success-100 p-2 dark:bg-success-900">
                      <Icon icon="solar:user-check-broken" className="text-lg text-success" />
                    </div>
                    <div>
                      <p className="font-medium">New user registered</p>
                      <p className="text-small text-foreground-500">
                        Kofi Mensah joined the platform
                      </p>
                      <p className="mt-1 text-tiny text-foreground-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  );
};
