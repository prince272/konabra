export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Konabra",
  description: "Konabra is a community-powered platform that helps make roads safer in Ghana through real-time reporting, alerts, and data-driven insights.",
  navItems: [
    {
      label: "Home",
      href: "/"
    },
    {
      label: "Docs",
      href: "/docs"
    },
    {
      label: "Pricing",
      href: "/pricing"
    },
    {
      label: "Blog",
      href: "/blog"
    },
    {
      label: "About",
      href: "/about"
    }
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile"
    },
    {
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      label: "Projects",
      href: "/projects"
    },
    {
      label: "Team",
      href: "/team"
    },
    {
      label: "Calendar",
      href: "/calendar"
    },
    {
      label: "Settings",
      href: "/settings"
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback"
    },
    {
      label: "Logout",
      href: "/logout"
    }
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev"
  }
};
