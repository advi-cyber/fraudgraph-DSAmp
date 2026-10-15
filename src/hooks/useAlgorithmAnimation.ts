import { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmStep } from '../types/algorithm';

export function useAlgorithmAnimation() {
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(750); // ms per step

  const timerRef = useRef<number | null>(null);

  const loadSteps = useCallback((newSteps: AlgorithmStep[]) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSteps(newSteps);
    setCurrentStepIndex(newSteps.length > 0 ? 0 : -1);
  }, []);

  const play = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [steps.length, currentStepIndex]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const next = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  const prev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const jumpToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index);
      }
    },
    [steps.length]
  );

  const reset = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStepIndex(steps.length > 0 ? 0 : -1);
  }, [steps.length]);

  const clear = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSteps([]);
    setCurrentStepIndex(-1);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, steps.length]);

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  return {
    steps,
    currentStepIndex,
    currentStep,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    loadSteps,
    play,
    pause,
    next,
    prev,
    jumpToStep,
    reset,
    clear,
  };
}
