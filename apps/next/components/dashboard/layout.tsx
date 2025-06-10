"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import { Button } from "@heroui/button";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/drawer";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Tooltip } from "@heroui/tooltip";
import {
  AlertTriangle,
  Bell,
  Menu,
  Search,
  Sidebar as SidebarIcon,
  TrafficCone,
  UserCheck,
  X
} from "lucide-react";
import { stringifyPath } from "@/utils";
import { categoryService } from "@/services";
import { useAccountState } from "@/states";
import { categoryStore } from "@/states/categories";
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

  useEffect(() => {
    categoryStore.load(async () => {
      const [categories, problem] = await categoryService.getPaginatedCategories({ limit: 100 });
      if (problem) {
        console.error("Failed to load categories:", problem);
        return [];
      }

      return categories.items;
    });
  }, []);

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
            <DrawerBody className="p-0">
                          <Sidebar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Main content */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <Navbar maxWidth="full" className="bg-content2">
          <NavbarContent justify="start">
            {isSmallScreen ? (
              <NavbarItem>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setIsSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
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
                  <SidebarIcon size={20} />
                </Button>
              </NavbarItem>
            )}
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <div className="flex items-center gap-2">
                <Tooltip content="Search">
                  <Button isIconOnly variant="light" aria-label="Search">
                    <Search size={20} />
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
                      <Bell size={20} />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                        3
                      </span>
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
                  <X size={20} />
                </Button>
              </div>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-4">
                <div className="rounded-medium bg-content2 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900">
                      <AlertTriangle size={20} className="text-primary" />
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
                      <TrafficCone size={20} className="text-warning" />
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
                      <UserCheck size={20} className="text-success" />
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
        <main className="flex flex-1 flex-col overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
