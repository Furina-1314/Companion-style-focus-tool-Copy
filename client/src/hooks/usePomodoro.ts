import { useEffect, useRef, useCallback } from "react";
import { useGame } from "@/contexts/GameContext";
import { getAudioContext, playCompleteSound } from "@/lib/sound";

export function usePomodoro() {
  const { state, dispatch } = useGame();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);

  // Timer tick
  useEffect(() => {
    if (state.isTimerRunning) {
      // 防止重复创建 interval（React StrictMode 双重渲染保护）
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isTimerRunning, dispatch]);

  // Timer completion
  useEffect(() => {
    if (state.isTimerRunning && state.timeRemaining <= 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      dispatch({ type: "COMPLETE_SESSION" });
      playCompleteSound();
    }
    
    if (state.timeRemaining > 0) {
      hasCompletedRef.current = false;
    }
  }, [state.isTimerRunning, state.timeRemaining, dispatch]);

  const start = useCallback(() => {
    getAudioContext(); // 初始化音频
    dispatch({ type: "START_TIMER" });
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE_TIMER" });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET_TIMER" });
    hasCompletedRef.current = false;
  }, [dispatch]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    // 分钟去掉前导零（0 显示为 0 而不是 00）
    return `${m.toString()}:${s.toString().padStart(2, "0")}`;
  }, []);

  const totalSeconds =
    state.timerMode === "focus"
      ? state.pomodoroMinutes * 60
      : state.timerMode === "longBreak"
      ? state.longBreakMinutes * 60
      : state.breakMinutes * 60;
  
  const progress = 1 - state.timeRemaining / totalSeconds;

  return {
    timeRemaining: state.timeRemaining,
    isRunning: state.isTimerRunning,
    mode: state.timerMode,
    progress,
    formattedTime: formatTime(state.timeRemaining),
    start,
    pause,
    reset,
  };
}
