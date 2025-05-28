"use client";

import { useCallback, useEffect, useInsertionEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Extend the History interface to include the _patched property
declare global {
  interface History {
    _patched?: boolean;
  }
}

// Centralized event emitter for hash changes
const hashChangeEmitter = {
  listeners: new Set<() => void>(),
  subscribe: (callback: () => void) => {
    hashChangeEmitter.listeners.add(callback);
    return () => hashChangeEmitter.listeners.delete(callback);
  },
  notify: () => {
    if (typeof window === "undefined") return;
    hashChangeEmitter.listeners.forEach((callback) => callback());
  }
};

// Monkey-patch history methods once
if (typeof window !== "undefined" && !window.history._patched) {
  const { pushState, replaceState } = window.history;

  const patched = function (method: typeof pushState) {
    return function (this: any, data: any, unused: string, url?: string | URL | null | undefined) {
      const result = method.apply(this, [data, unused, url]);
      if (url !== window.location.href) {
        setTimeout(hashChangeEmitter.notify, 0);
      }
      return result;
    };
  };

  window.history.pushState = patched(pushState);
  window.history.replaceState = patched(replaceState);
  window.history._patched = true;

  window.addEventListener("hashchange", () => setTimeout(hashChangeEmitter.notify, 0));
}

export const useHashState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentHash = () =>
    typeof window !== "undefined" ? window.location.hash.replace(/^#!?/, "") : "";

  const [hash, setHashState] = useState<string>(getCurrentHash());

  // Use useInsertionEffect for subscription setup
  useInsertionEffect(() => {
    if (typeof window === "undefined") return;

    // This effect only sets up the subscription
    const unsubscribe = hashChangeEmitter.subscribe(() => {
      // The actual state update will happen in a useEffect
      requestAnimationFrame(() => {
        setHashState(getCurrentHash());
      });
    });

    return () => { unsubscribe(); };
  }, []);

  // Use regular useEffect for the initial hash sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHashState(getCurrentHash());
    }
  }, []);

  const setHash = useCallback(
    (newHash: string, shallow: boolean = false) => {
      if (typeof window === "undefined") return;
      const cleanHash = newHash.startsWith("#") ? newHash : `#${newHash}`;

      if (cleanHash !== window.location.hash) {
        if (shallow) {
          window.history.replaceState(
            window.history.state,
            "",
            `${pathname}${searchParams ? `?${searchParams}` : ""}${cleanHash}`
          );
          setTimeout(hashChangeEmitter.notify, 0);
        } else {
          router.replace(`${pathname}${searchParams ? `?${searchParams}` : ""}${cleanHash}`, {
            scroll: false
          });
        }
      }
    },
    [router, pathname, searchParams]
  );

  const removeHash = useCallback(
    (shallow: boolean = false) => {
      if (typeof window === "undefined") return;

      if (shallow) {
        window.history.replaceState(
          window.history.state,
          "",
          `${pathname}${searchParams ? `?${searchParams}` : ""}`
        );
        setTimeout(hashChangeEmitter.notify, 0);
      } else {
        router.replace(`${pathname}${searchParams ? `?${searchParams}` : ""}`, {
          scroll: false
        });
      }
    },
    [router, pathname, searchParams]
  );

  return [hash, setHash, removeHash] as const;
};
