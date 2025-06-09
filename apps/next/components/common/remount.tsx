import { useEffect, useState } from "react";

interface RemountProps {
  interval: number;
  children: React.ReactNode | ((key: number) => React.ReactNode);
}

export const Remount = ({ interval, children }: RemountProps) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setKey((prev) => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return <>{typeof children === "function" ? children(key) : children}</>;
};
