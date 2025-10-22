"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage?: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setLoading: (isLoading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * Global loading context provider
 * Manages loading states across the entire application
 */
export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean;
    loadingMessage?: string;
  }>({
    isLoading: false,
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

  const value = {
    ...loadingState,
    startLoading,
    stopLoading,
    setLoading,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

/**
 * Hook to use the loading context
 */
export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoadingContext must be used within a LoadingProvider");
  }
  return context;
};
