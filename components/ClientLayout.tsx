"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLoadingContext } from "@/lib/contexts/LoadingContext";
import {
  PageContentShimmer,
  UploadFormShimmer,
  ProfileShimmer,
} from "./LoadingShimmer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Client-side layout wrapper that handles loading states during navigation
 * Provides immediate visual feedback for page transitions
 */
const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const pathname = usePathname();
  const { startLoading, stopLoading } = useLoadingContext();

  useEffect(() => {
    // If pathname changed, show loading state
    if (currentPath && currentPath !== pathname) {
      setIsNavigating(true);
      startLoading("Loading page...");

      // Hide loading state after a short delay
      const timer = setTimeout(() => {
        setIsNavigating(false);
        stopLoading();
      }, 300);

      return () => clearTimeout(timer);
    }

    setCurrentPath(pathname);
  }, [pathname, currentPath, startLoading, stopLoading]);

  // Show loading state during navigation
  if (isNavigating) {
    return <LoadingContent pathname={pathname} />;
  }

  return <>{children}</>;
};

/**
 * Renders appropriate loading content based on the current pathname
 */
const LoadingContent = ({ pathname }: { pathname: string }) => {
  if (pathname === "/upload") {
    return (
      <main className="upload-page">
        <div className="overlay" />
        <div className="upload-hero">
          <div className="wrapper">
            <div className="flex flex-col gap-3">
              <div className="w-32 h-4 bg-gray-20 rounded animate-pulse" />
              <div className="w-96 h-12 bg-gray-20 rounded animate-pulse" />
              <div className="w-80 h-6 bg-gray-20 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <UploadFormShimmer />
      </main>
    );
  }

  if (pathname.startsWith("/profile/")) {
    return <ProfileShimmer />;
  }

  if (pathname.startsWith("/video/")) {
    return (
      <main className="wrapper page">
        <div className="video-details">
          <div className="content">
            <div className="w-full h-96 bg-gray-20 rounded-2xl animate-pulse" />
          </div>
          <div className="w-full max-w-350 xl:max-w-410">
            <div className="space-y-6">
              <div className="w-full h-8 bg-gray-20 rounded animate-pulse" />
              <div className="w-full h-32 bg-gray-20 rounded animate-pulse" />
              <div className="w-full h-24 bg-gray-20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Default loading for home page and other routes
  return <PageContentShimmer />;
};

export default ClientLayout;
