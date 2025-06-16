"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { isEqual } from "lodash";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import Cookies from "universal-cookie";

// ----- TYPES -----
type CookiesContextValue = string | object | null | undefined;

type CookieOptions = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
};

// ----- DEFAULT OPTIONS -----
const defaultCookieOptions: CookieOptions = {
  path: "/",
  expires: new Date("9999-12-31T23:59:59.999Z"), // Indefinitely persistent
};

// ----- BROADCAST CHANNEL FOR CROSS-TAB SYNC -----
const COOKIE_CHANNEL = "cookie-sync-channel";
const broadcastChannel = typeof window !== "undefined" ? new BroadcastChannel(COOKIE_CHANNEL) : null;

// ----- CONTEXT PROVIDER -----
const CookiesContext = createContext<CookiesContextValue>(undefined);

export const CookiesProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value?: CookiesContextValue;
}) => {
  return <CookiesContext.Provider value={value}>{children}</CookiesContext.Provider>;
};

// ----- COOKIES HOOK -----
export const useCookies = () => {
  const context = useContext(CookiesContext);
  const cookiesRef = useRef<Cookies>();

  if (!cookiesRef.current) {
    cookiesRef.current = new Cookies(context ?? {}, { path: "/" });
  }

  return cookiesRef.current;
};

// ----- COOKIE SUBJECT REGISTRY -----
const cookieSubjects: { [key: string]: BehaviorSubject<any> } = {};

function getCookieSubject<S>(key: string, initialValue: S): BehaviorSubject<S> {
  if (!cookieSubjects[key]) {
    cookieSubjects[key] = new BehaviorSubject<S>(initialValue);
  }
  return cookieSubjects[key] as BehaviorSubject<S>;
}

export function clearCookieSubject(key: string) {
  if (cookieSubjects[key]) {
    cookieSubjects[key].complete();
    delete cookieSubjects[key];
  }
}

// ----- useCookieState HOOK -----
export function useCookieState<S>(
  key: string,
  initialState: S | (() => S),
  options?: CookieOptions
): [S, Dispatch<SetStateAction<S>>] {
  const cookies = useCookies();
  const optionsRef = useRef<CookieOptions>(options ?? defaultCookieOptions);
  const isMountedRef = useRef(false);

  const initial = useRef(() => {
    const cookieValue = cookies.get(key);
    if (cookieValue !== undefined && cookieValue !== null) {
      return cookieValue;
    }
    return typeof initialState === "function" ? (initialState as () => S)() : initialState;
  });

  const subject = getCookieSubject<S>(key, initial.current());
  const [state, setState] = useState<S>(subject.value);

  // Subscribe to subject updates
  useEffect(() => {
    const sub = subject.pipe(distinctUntilChanged(isEqual)).subscribe(setState);
    return () => sub.unsubscribe();
  }, [subject]);

  // Handle cross-tab cookie updates via BroadcastChannel
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { key: updatedKey, value } = event.data;
      if (updatedKey === key) {
        const parsedValue =
          typeof value === "string" && value.startsWith("{") ? JSON.parse(value) : value;
        if (!isEqual(parsedValue, subject.value)) {
          subject.next(parsedValue);
        }
      }
    };

    broadcastChannel.addEventListener("message", handleMessage);
    return () => broadcastChannel.removeEventListener("message", handleMessage);
  }, [key, subject]);

  // Sync cookie on state change
  useEffect(() => {
    if (isMountedRef.current) {
      const serializedState =
        typeof state === "object" && state !== null ? JSON.parse(JSON.stringify(state)) : state;
      cookies.set(key, serializedState, optionsRef.current);
      subject.next(serializedState);
      broadcastChannel?.postMessage({ key, value: serializedState });
    } else {
      isMountedRef.current = true;
    }
  }, [key, state, cookies]);

  // Updater function
  const setCookieState: Dispatch<SetStateAction<S>> = useCallback(
    (action) => {
      const newValue =
        typeof action === "function" ? (action as (prev: S) => S)(subject.value) : action;
      const serializedValue =
        typeof newValue === "object" && newValue !== null
          ? JSON.parse(JSON.stringify(newValue))
          : newValue;
      cookies.set(key, serializedValue, optionsRef.current);
      subject.next(serializedValue);
      broadcastChannel?.postMessage({ key, value: serializedValue });
    },
    [subject, key, cookies]
  );

  return [state, setCookieState];
}
