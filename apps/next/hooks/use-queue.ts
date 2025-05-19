// useQueue.ts
import PQueue from "p-queue";
import { useCallback, useEffect, useRef } from "react";

export function useQueue(options?: ConstructorParameters<typeof PQueue>[0]) {
  const queueRef = useRef<PQueue>();

  if (!queueRef.current) {
    queueRef.current = new PQueue({
      concurrency: 1,
      ...options
    });
  }

  useEffect(() => {
    return () => {
      queueRef.current?.clear();
      queueRef.current?.pause();
    };
  }, []);

  const add = useCallback(<T>(fn: () => Promise<T>) => {
    return queueRef.current!.add(fn);
  }, []);

  const onIdle = useCallback(() => queueRef.current!.onIdle(), []);
  const clear = useCallback(() => queueRef.current!.clear(), []);
  const pause = useCallback(() => queueRef.current!.pause(), []);
  const start = useCallback(() => queueRef.current!.start(), []);
  const isPaused = useCallback(() => queueRef.current!.isPaused, []);
  const size = useCallback(() => queueRef.current!.size, []);
  const pending = useCallback(() => queueRef.current!.pending, []);

  return {
    add,
    onIdle,
    clear,
    pause,
    start,
    isPaused,
    size,
    pending
  };
}
