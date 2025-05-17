"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useHashState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentHash = () =>
    typeof window !== "undefined" ? window.location.hash.replace(/^#!?/, "") : "";

  const [hash, setHashState] = useState<string>(getCurrentHash());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      setHashState(getCurrentHash());
    };

    const { pushState, replaceState } = window.history;

    // Monkey-patch pushState and replaceState to track hash updates
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      setTimeout(handleHashChange, 0);
    };
    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args);
      setTimeout(handleHashChange, 0);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.history.pushState = pushState;
      window.history.replaceState = replaceState;
    };
  }, []);

  const setHash = useCallback(
    (newHash: string) => {
      if (typeof window === "undefined") return;
      const cleanHash = newHash.startsWith("#") ? newHash : `#${newHash}`;
      if (cleanHash !== window.location.hash) {
        setHashState(cleanHash.slice(1));
        router.replace(`${pathname}${searchParams ? `?${searchParams}` : ""}${cleanHash}`, {
          scroll: false
        });
      }
    },
    [router, pathname, searchParams]
  );

  const removeHash = useCallback(() => {
    if (typeof window === "undefined") return;
    setHashState("");
    router.replace(`${pathname}${searchParams ? `?${searchParams}` : ""}`, {
      scroll: false
    });
  }, [router, pathname, searchParams]);

  return [hash, setHash, removeHash] as const;
};
