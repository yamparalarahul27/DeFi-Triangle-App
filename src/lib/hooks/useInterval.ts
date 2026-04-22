"use client";

import { useEffect, useRef } from "react";

export function useInterval(
  callback: () => void,
  delayMs: number | null
): void {
  const savedRef = useRef(callback);

  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs == null || delayMs <= 0) return;
    const id = setInterval(() => savedRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}
