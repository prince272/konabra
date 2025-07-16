import { useState, useEffect } from "react";
import { useAccountState } from "@/states";
import { useBreakpoint, useHashState } from "@/hooks";

export function useSettingsModalLogic({ onClose }: { onClose?: () => void }) {
  const [hash, setHash] = useHashState();
  const [currentAccount] = useAccountState();
  const [currentView, setCurrentView] = useState<string>(hash.split(":").slice(1).join(":") || "");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isMenuSelected, setIsMenuSelected] = useState<boolean>(false);
  const [viewInfo, setViewInfo] = useState<{ title: string; icon: string }>({
    title: "Settings",
    icon: "settings"
  });

  const isSmallScreen = useBreakpoint("sm", "down");

  const menuItems: { id: string; label: string; icon: string }[] = [
    { id: "account", label: "Account", icon: "user" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "display", label: "Display", icon: "monitor" },
    { id: "sound", label: "Sound", icon: "soundwave" },
    { id: "storage", label: "Storage", icon: "folder" },
    { id: "privacy", label: "Privacy", icon: "lock" }
  ];

  const viewInfoMap: Record<string, { title: string; icon: string }> = {
    "": { title: "Settings", icon: "settings" },
    account: { title: "Account", icon: "user" },
    notifications: { title: "Notifications", icon: "bell" },
    display: { title: "Display", icon: "monitor" },
    sound: { title: "Sound", icon: "soundwave" },
    storage: { title: "Storage", icon: "folder" },
    privacy: { title: "Privacy", icon: "lock" }
  };

  useEffect(() => {
    const mainViewId = currentView.split(":")[0] || "";
    const info = viewInfoMap[mainViewId] || {
      title: "Settings",
      icon: "settings"
    };
    setViewInfo(info);
  }, [currentView]);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    setIsMenuSelected(true);
    if (isSmallScreen) {
      setShowSidebar(false);
    }
    setHash(`settings:${view}`);
  };

  const backToMenu = () => {
    setIsMenuSelected(false);
    setShowSidebar(true);
    setCurrentView("");
  };

  const backToParent = () => {
    const parentView = currentView.split(":").slice(0, -1).join(":");
    navigateTo(parentView || "");
  };

  useEffect(() => {
    setShowSidebar(isSmallScreen ? !isMenuSelected : true);
    if (!isSmallScreen && !isMenuSelected && !currentView) {
      setCurrentView("account");
      setIsMenuSelected(true);
    }
  }, [isSmallScreen, isMenuSelected, currentView]);

  const animationVariants = {
    enter: {
      x: "-20%",
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.15, ease: "easeOut" }
    },
    exit: {
      x: "20%",
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  return {
    hash,
    setHash,
    currentAccount,
    currentView,
    setCurrentView,
    showSidebar,
    setShowSidebar,
    isMenuSelected,
    setIsMenuSelected,
    viewInfo,
    isSmallScreen,
    menuItems,
    navigateTo,
    backToMenu,
    backToParent,
    viewInfoMap,
    animationVariants
  };
}
