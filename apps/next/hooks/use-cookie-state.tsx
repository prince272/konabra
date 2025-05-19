"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import Cookies from "universal-cookie";

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
    cookieListeners[key].forEach((callback) => callback(value));
  }
}

const CookiesContext = createContext<string | object | null | undefined>(undefined);

export const CookiesProvider = ({
  children,
  value
}: {
  children: ReactNode;
  value?: string | object | null;
}) => {
  return <CookiesContext.Provider value={value}>{children}</CookiesContext.Provider>;
};

export const useCookiesContext = () => {
  const context = useContext(CookiesContext);
  if (!context) {
    throw new Error("useCookiesContext must be used within a CookiesProvider");
  }
  const cookies = new Cookies(context, { path: "/" });
  return cookies;
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
  const cookiesContext = useCookiesContext();

  const [state, setState] = useState<S>(() => {
    const cookieValue = cookiesContext.get(key);
    if (cookieValue !== undefined) return cookieValue;
    return typeof initialState === "function" ? (initialState as () => S)() : initialState;
  });

  // Sync state with external changes to the same key
  useEffect(() => {
    const unsubscribe = subscribeToCookie(key, (newValue) => {
      // Only update state if the new value is different to avoid infinite loops
      setState((prevState) =>
        JSON.stringify(prevState) !== JSON.stringify(newValue) ? newValue : prevState
      );
    });
    return unsubscribe;
  }, [key]);

  // Update cookie and notify listeners on state change
  useEffect(() => {
    cookiesContext.set(key, state, { path: "/", ...options });
    emitCookieChange(key, state);
  }, [key, state, options, cookiesContext]);

  const setCookieState: Dispatch<SetStateAction<S>> = useCallback(
    (action: SetStateAction<S>) => {
      setState((prevState) => {
        const newValue =
          typeof action === "function" ? (action as (prevState: S) => S)(prevState) : action;
        // Cookie update and listener notification handled by useEffect
        return newValue;
      });
    },
    [key]
  );

  return [state, setCookieState];
}
