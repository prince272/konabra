import { DependencyList, useEffect, useRef, useState } from "react";

export function useInterval<T extends (...args: any[]) => void>(
  delay: number,
  callback: T,
  deps: DependencyList = []
): number {
  const savedCallback = useRef<T>();
  const [tickCount, setTickCount] = useState(0);

  // Update saved callback if callback or deps change
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current?.();
      setTickCount((prev) => prev + 1);
    };

    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);

  return tickCount;
}
