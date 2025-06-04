import { useEffect, useState } from "react";

export function useAsyncMemo<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
  initialValue: T
): [T, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    asyncFn()
      .then((result) => {
        if (isMounted) {
          setValue(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        // In case of error, we still want to stop loading.
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
