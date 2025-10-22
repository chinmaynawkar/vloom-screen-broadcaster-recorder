"use client";

import { useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

/**
 * Custom hook for managing loading states
 * Provides utilities for showing/hiding loading states with optional messages
 */
export const useLoading = (initialState: boolean = false) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialState,
  });

  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      loadingMessage: message,
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingMessage: undefined,
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setLoadingState({
      isLoading,
      loadingMessage: message,
    });
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    setLoading,
  };
};

/**
 * Hook for managing async operations with loading states
 */
export const useAsyncLoading = () => {
  const { isLoading, loadingMessage, startLoading, stopLoading, setLoading } = useLoading();

  const executeAsync = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      loadingMessage?: string
    ): Promise<T> => {
      try {
        startLoading(loadingMessage);
        const result = await asyncFn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    loadingMessage,
    executeAsync,
    startLoading,
    stopLoading,
    setLoading,
  };
};
