"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/system";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ModalQueueProvider } from "@/components/common/models";
import { ToastProvider } from "@heroui/toast";
import { CookiesProvider } from "@/hooks";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  cookies?: Record<string, any>;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, cookies, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <ToastProvider placement="top-center" />
        <CookiesProvider value={cookies}>
          <ModalQueueProvider>{children}</ModalQueueProvider>
        </CookiesProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
