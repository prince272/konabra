import { useEffect, useRef, useState } from "react";

export function useAsyncMemo<T>(
  asyncFn: (prevValue: T) => Promise<T>,
  deps: React.DependencyList,
  initialValue: T
): [T, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const valueRef = useRef<T>(initialValue);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    asyncFn(valueRef.current)
      .then((result) => {
        if (isMounted) {
          valueRef.current = result;
          setValue(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, deps);

  return [value, isLoading];
}
