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

// ----- CONTEXT PROVIDER -----
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
  const optionsRef = useRef(options);
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

  // Sync cookie on state change
  useEffect(() => {
    if (isMountedRef.current) {
      const serializedState =
        typeof state === "object" && state !== null ? JSON.parse(JSON.stringify(state)) : state;
      cookies.set(key, serializedState, optionsRef.current || { path: "/" });
      subject.next(serializedState);
    } else {
      isMountedRef.current = true;
    }
  }, [key, state]);

  // Updater function
  const setCookieState: Dispatch<SetStateAction<S>> = useCallback(
    (action) => {
      const newValue =
        typeof action === "function" ? (action as (prev: S) => S)(subject.value) : action;
      const serializedValue =
        typeof newValue === "object" && newValue !== null
          ? JSON.parse(JSON.stringify(newValue))
          : newValue;
      cookies.set(key, serializedValue, optionsRef.current || { path: "/" });
      subject.next(serializedValue);
    },
    [subject, key, cookies]
  );

  return [state, setCookieState];
}
