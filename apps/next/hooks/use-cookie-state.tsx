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
import Cookies from "universal-cookie";
import { isEqual } from "lodash"; // Add lodash for deep equality checks

// Centralized event emitter for cookie state changes
const cookieListeners: { [key: string]: Array<(value: any) => void> } = {};

function subscribeToCookie(key: string, callback: (value: any) => void) {
  if (!cookieListeners[key]) {
    cookieListeners[key] = [];
  }
  cookieListeners[key].push(callback);
  return () => {
    cookieListeners[key] = cookieListeners[key].filter((cb) => cb !== callback);
  };
}

function emitCookieChange(key: string, value: any) {
  if (cookieListeners[key]) {
    requestAnimationFrame(() => {
      cookieListeners[key].forEach((callback) => callback(value));
    });
  }
}

type CookiesContextValue = string | object | null | undefined;

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

export const useCookies = () => {
  const context = useContext(CookiesContext);
  const cookiesRef = useRef<Cookies>();

  if (!cookiesRef.current) {
    cookiesRef.current = new Cookies(context ?? {}, { path: "/" });
  }

  return cookiesRef.current;
};

type CookieOptions = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
};

export function useCookieState<S>(
  key: string,
  initialState: S | (() => S),
  options?: CookieOptions
): [S, Dispatch<SetStateAction<S>>] {
  const cookies = useCookies();
  const optionsRef = useRef(options);
  const isMountedRef = useRef(false);

  const [state, setState] = useState<S>(() => {
    const cookieValue = cookies.get(key);
    // Handle null/undefined cookie values
    if (cookieValue !== undefined && cookieValue !== null) {
      return cookieValue;
    }
    return typeof initialState === "function" ? (initialState as () => S)() : initialState;
  });

  // Sync state with external cookie updates
  useEffect(() => {
    const unsubscribe = subscribeToCookie(key, (newValue) => {
      if (isMountedRef.current) {
        setState((prevState) => (isEqual(prevState, newValue) ? prevState : newValue));
      }
    });
    return unsubscribe;
  }, [key]);

  // Update cookie when state changes
  useEffect(() => {
    if (isMountedRef.current) {
      // Serialize state to ensure it's safe for cookies
      const serializedState =
        typeof state === "object" && state !== null ? JSON.parse(JSON.stringify(state)) : state;
      cookies.set(key, serializedState, optionsRef.current || { path: "/" });
      emitCookieChange(key, serializedState);
    } else {
      isMountedRef.current = true;
    }
  }, [key, state, cookies]);

  const setCookieState: Dispatch<SetStateAction<S>> = useCallback(
    (action) => {
      setState((prevState) => {
        const newValue =
          typeof action === "function" ? (action as (prevState: S) => S)(prevState) : action;
        // Serialize newValue to ensure it's safe for cookies
        const serializedValue =
          typeof newValue === "object" && newValue !== null
            ? JSON.parse(JSON.stringify(newValue))
            : newValue;
        cookies.set(key, serializedValue, optionsRef.current || { path: "/" });
        emitCookieChange(key, serializedValue);
        return serializedValue;
      });
    },
    [key, cookies]
  );

  return [state, setCookieState];
}