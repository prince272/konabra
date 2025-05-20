import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/navbar";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { cookies as getCookiesStore } from "next/headers";
import { Link } from "@heroui/link";
import { cn } from "@heroui/theme";
import { Providers } from "../components/providers";
import { ResetPasswordModalRouter } from "./account/reset-password-modal";
import { SettingsModalRouter } from "./account/settings-modal";
import { SignInModalRouter } from "./account/signin-modal";
import { SignUpModalRouter } from "./account/signup-modal";

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
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers cookies={cookies} themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <Navbar />
          <main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">{children}</main>
          <footer className="flex w-full items-center justify-center py-3">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://heroui.com?utm_source=next-app-template"
              title="heroui.com homepage"
            >
              <span className="text-default-600">Powered by</span>
              <p className="text-primary">HeroUI</p>
            </Link>
          </footer>
          <SignUpModalRouter />
          <SignInModalRouter />
          <ResetPasswordModalRouter />
          <SettingsModalRouter />
        </Providers>
      </body>
    </html>
  );
}
