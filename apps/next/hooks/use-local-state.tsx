"use client";

import {
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

// Centralized event emitter for local state changes
const localStateListeners: { [key: string]: Array<(value: any) => void> } = {};
const localStateStorage: { [key: string]: any } = {};

function subscribeToLocalState(key: string, callback: (value: any) => void) {
  if (!localStateListeners[key]) {
    localStateListeners[key] = [];
  }
  localStateListeners[key].push(callback);
  return () => {
    localStateListeners[key] = localStateListeners[key].filter((cb) => cb !== callback);
  };
}

function emitLocalStateChange(key: string, value: any) {
  if (localStateListeners[key]) {
    requestAnimationFrame(() => {
      localStateListeners[key].forEach((callback) => callback(value));
    });
  }
}

export function useLocalState<S>(
  key: string,
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] {
  const isMountedRef = useRef(false);

  const [state, setState] = useState<S>(() => {
    // Check if there's a stored value in memory
    if (localStateStorage[key] !== undefined) {
      return localStateStorage[key];
    }
    return typeof initialState === "function" ? (initialState as () => S)() : initialState;
  });

  // Sync state with external local state updates
  useEffect(() => {
    const unsubscribe = subscribeToLocalState(key, (newValue) => {
      if (isMountedRef.current) {
        setState((prevState) => (isEqual(prevState, newValue) ? prevState : newValue));
      }
    });
    return unsubscribe;
  }, [key]);

  // Update local storage when state changes
  useEffect(() => {
    if (isMountedRef.current) {
      localStateStorage[key] = state;
      emitLocalStateChange(key, state);
    } else {
      isMountedRef.current = true;
    }
  }, [key, state]);

  const setLocalState: Dispatch<SetStateAction<S>> = useCallback(
    (action) => {
      setState((prevState) => {
        const newValue =
          typeof action === "function" ? (action as (prevState: S) => S)(prevState) : action;
        localStateStorage[key] = newValue;
        emitLocalStateChange(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  return [state, setLocalState];
}