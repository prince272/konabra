"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CookiesProvider, useBreakpoint } from "@/hooks";
import { ModalQueueProvider } from "@/components/common/modals";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  cookies?: Record<string, any>;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export function Providers({ children, cookies, themeProps }: ProvidersProps) {
  const router = useRouter();
  const isSmallScreen = useBreakpoint("sm", "down");

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <ProgressProvider
          height="2px"
          color="hsl(var(--heroui-primary))"
          options={{ showSpinner: false }}
          delay={100}
          shallowRouting
        >
          <ToastProvider placement={isSmallScreen ? "bottom-center" : "top-center"} />
          <CookiesProvider value={cookies}>
            <ModalQueueProvider>{children}</ModalQueueProvider>
          </CookiesProvider>
        </ProgressProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
