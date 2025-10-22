"use client";

import { useLoadingContext } from "@/lib/contexts/LoadingContext";

/**
 * Global loading overlay that appears during navigation and data fetching
 * Provides consistent loading experience across the application
 */
const GlobalLoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoadingContext();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/90 backdrop-blur-lg border border-white/30 shadow-2xl">
        {/* Loading spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-purple-500"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-purple-300"></div>
        </div>

        {/* Loading message */}
        {loadingMessage && (
          <p className="text-sm font-medium text-dark-100 text-center max-w-xs">
            {loadingMessage}
          </p>
        )}

        {/* Loading dots animation */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
