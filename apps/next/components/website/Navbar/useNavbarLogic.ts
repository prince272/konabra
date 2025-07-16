import React from "react";
import { useAccountState } from "@/states";

export function useNavbarLogic() {
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

  return {
    isMenuOpen,
    setIsMenuOpen,
    activeItem,
    menuItems,
    currentAccount
  };
}
