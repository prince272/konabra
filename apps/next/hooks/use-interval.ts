import { useEffect, useRef, DependencyList } from 'react';

export function useInterval<T extends (...args: any[]) => void>(
  callback: T,
  delay: number | null,
  deps: DependencyList = []
): void {
  const savedCallback = useRef<T>();

  // Update saved callback if callback or deps change
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}