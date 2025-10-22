"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLoadingContext } from "@/lib/contexts/LoadingContext";

/**
 * Hook for managing loading states during navigation
 * Provides immediate visual feedback when users navigate between pages
 */
export const useNavigationLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStartTime, setNavigationStartTime] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingContext();

  useEffect(() => {
    // Reset navigation state when pathname changes
    if (isNavigating) {
      const navigationTime = Date.now() - (navigationStartTime || 0);
      
      // Ensure minimum loading time for better UX
      const minLoadingTime = 300;
      const remainingTime = Math.max(0, minLoadingTime - navigationTime);
      
      setTimeout(() => {
        setIsNavigating(false);
        setNavigationStartTime(null);
        stopLoading();
      }, remainingTime);
    }
  }, [pathname, isNavigating, navigationStartTime, stopLoading]);

  const navigateWithLoading = (url: string, loadingMessage?: string) => {
    setIsNavigating(true);
    setNavigationStartTime(Date.now());
    startLoading(loadingMessage || "Loading...");
    router.push(url);
  };

  const replaceWithLoading = (url: string, loadingMessage?: string) => {
    setIsNavigating(true);
    setNavigationStartTime(Date.now());
    startLoading(loadingMessage || "Loading...");
    router.replace(url);
  };

  return {
    isNavigating,
    navigateWithLoading,
    replaceWithLoading,
  };
};
