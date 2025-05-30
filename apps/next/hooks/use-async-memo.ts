import { useEffect, useMemo, useState } from "react";

export function useAsyncMemo<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    let isMounted = true;
    asyncFn().then((result) => {
      if (isMounted) setValue(result);
    });
    return () => {
      isMounted = false;
    };
  }, deps);

  return value;
}
