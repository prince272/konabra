import { fontMontserrat, fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { cookies as getCookiesStore } from "next/headers";
import { cn } from "@heroui/theme";
import { FeaturesSection } from "@/components/website/features-section";
import { Hero } from "@/components/website/hero";
import { Navbar } from "@/components/website/navbar";
import { Providers } from "../components/providers";
import { ResetPasswordModalRouter } from "./account/reset-password-modal";
import { SettingsModalRouter } from "./account/settings-modal";
import { SignInModalRouter } from "./account/signin-modal";
import { SignUpModalRouter } from "./account/signup-modal";
import { AlertsSection } from "@/components/website/alerts-section";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico"
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookiesStore = await getCookiesStore();
  const cookies = cookiesStore.getAll().reduce<Record<string, any>>((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {});

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontMontserrat.variable)}>
        <Providers cookies={cookies} themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <Navbar />
          <Hero />
          <FeaturesSection />
          <AlertsSection />
          <SignUpModalRouter />
          <SignInModalRouter />
          <ResetPasswordModalRouter />
          <SettingsModalRouter />
        </Providers>
      </body>
    </html>
  );
}
