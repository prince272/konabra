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

type CookiesContextValue = string | object | null | undefined;

const CookiesContext = createContext<CookiesContextValue>(undefined);

export const CookiesProvider = ({
  children,
  value
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

  const getInitialState = useCallback(() => {
    const cookieValue = cookies.get(key);
    return cookieValue !== undefined
      ? cookieValue
      : typeof initialState === "function"
        ? (initialState as () => S)()
        : initialState;
  }, [cookies, key, initialState]);

  const [state, setState] = useState<S>(getInitialState);

  // Sync state with external cookie updates
  useEffect(() => {
    const unsubscribe = subscribeToCookie(key, (newValue) => {
      setState((prevState) =>
        JSON.stringify(prevState) !== JSON.stringify(newValue) ? newValue : prevState
      );
    });
    return unsubscribe;
  }, [key]);

  // Update cookie when state changes
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    cookies.set(key, stateRef.current, { path: "/", ...optionsRef.current });
    emitCookieChange(key, stateRef.current);
  }, [key, cookies]);

  const setCookieState: Dispatch<SetStateAction<S>> = useCallback(
    (action) => {
      setState((prevState) => {
        const newValue =
          typeof action === "function" ? (action as (prevState: S) => S)(prevState) : action;
        cookies.set(key, newValue, { path: "/", ...optionsRef.current });
        emitCookieChange(key, newValue);
        return newValue;
      });
    },
    [key, cookies]
  );

  return [state, setCookieState];
}
