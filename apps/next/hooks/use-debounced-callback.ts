import { useCallback } from "react";
import type { DependencyList } from "react";
import { useTimeout } from "./use-timeout";

/**
 * Creates a debounced function that will invoke the input function after the
 * specified delay.
 *
 * @param fn a function that will be debounced (should be memoized/stable)
 * @param dependencies An array of dependencies that will trigger re-creation of the debounced function (should include fn dependencies)
 * @param delay The milliseconds delay before invoking the function
 * @returns A debounced function
 */
export const useDebouncedCallback = <TCallback extends (...args: any[]) => any>(
  fn: TCallback,
  dependencies: DependencyList,
  delay: number
): ((...args: Parameters<TCallback>) => Promise<void>) => {
  const timeout = useTimeout();

  return useCallback(
    (...args: Parameters<TCallback>) => {
      return new Promise<void>((resolve) => {
        timeout.set(() => {
          fn(...args);
          resolve();
        }, delay);
      });
    },
    // Only re-create callback if delay or dependencies change.
    // fn should be stable or memoized outside to avoid rerenders here.
    [delay, ...dependencies]
  );
};
