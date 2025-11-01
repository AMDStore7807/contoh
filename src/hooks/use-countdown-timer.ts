import { useState, useEffect, useRef } from "react";

export function useCountdownTimer(expiryTime: number | null): string {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const intervalRef = useRef<number | null>(null);
  const expiryRef = useRef<number | null>(expiryTime);

  // Update the ref when expiryTime changes
  useEffect(() => {
    expiryRef.current = expiryTime;
  }, [expiryTime]);

  useEffect(() => {
    const updateTimer = () => {
      const currentExpiry = expiryRef.current;
      if (!currentExpiry) {
        setTimeLeft("");
        return;
      }

      const now = Date.now();
      const remaining = currentExpiry - now;

      if (remaining <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval if expiryTime exists
    if (expiryTime) {
      updateTimer(); // Update immediately
      intervalRef.current = window.setInterval(updateTimer, 1000);
    } else {
      setTimeLeft("");
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expiryTime]);

  return timeLeft;
}
