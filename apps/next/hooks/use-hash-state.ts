"use client";

import { useCallback, useEffect, useInsertionEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BehaviorSubject } from "rxjs";

// Extend the History interface to include the _patched property
declare global {
  interface History {
    _patched?: boolean;
  }
}

// Create a BehaviorSubject for hash changes
const hashChangeSubject = new BehaviorSubject<string>(
  typeof window !== "undefined" ? window.location.hash.replace(/^#!?/, "") : ""
);

// Monkey-patch history methods once
if (typeof window !== "undefined" && !window.history._patched) {
  const { pushState, replaceState } = window.history;

  const patched = function (method: typeof pushState) {
    return function (this: any, data: any, unused: string, url?: string | URL | null | undefined) {
      const result = method.apply(this, [data, unused, url]);
      if (url !== window.location.href) {
        setTimeout(() => {
          hashChangeSubject.next(window.location.hash.replace(/^#!?/, ""));
        }, 0);
      }
      return result;
    };
  };

  window.history.pushState = patched(pushState);
  window.history.replaceState = patched(replaceState);
  window.history._patched = true;

  window.addEventListener("hashchange", () => {
    setTimeout(() => {
      hashChangeSubject.next(window.location.hash.replace(/^#!?/, ""));
    }, 0);
  });
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

    const subscription = hashChangeSubject.subscribe({
      next: (newHash) => {
        setHashState(newHash);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
          hashChangeSubject.next(newHash);
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
        hashChangeSubject.next("");
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