"use client";

import { useState, useEffect, useCallback } from "react";

export function useOTP(initialTimer = 60) {
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = useCallback(() => {
    setTimer(initialTimer);
    setCanResend(false);
  }, [initialTimer]);

  const resetTimer = useCallback(() => {
    setTimer(0);
    setCanResend(true);
  }, []);

  return {
    timer,
    canResend,
    startTimer,
    resetTimer,
  };
}
