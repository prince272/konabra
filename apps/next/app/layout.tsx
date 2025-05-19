import { Navbar } from "@/components/navbar";
import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { cookies as getCookiesStore } from "next/headers";
import { Providers } from "../components/providers";
import { ResetPasswordModalRouter } from "./account/reset-password-modal";
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
      <body className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers cookies={cookies} themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">{children}</main>
            <footer className="w-full flex items-center justify-center py-3">
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
          </div>
          <SignUpModalRouter />
          <SignInModalRouter />
          <ResetPasswordModalRouter />
        </Providers>
      </body>
    </html>
  );
}
