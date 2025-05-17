"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/system";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ModalQueueProvider } from "@/components/common/models";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <ModalQueueProvider>{children}</ModalQueueProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
