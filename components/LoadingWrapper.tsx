"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  PageContentShimmer,
  UploadFormShimmer,
  ProfileShimmer,
} from "./LoadingShimmer";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

/**
 * Loading wrapper that shows appropriate loading states during navigation
 * Provides immediate visual feedback for page transitions
 */
const LoadingWrapper = ({ children }: LoadingWrapperProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading state immediately on route change
    setIsLoading(true);
    setLoadingKey((prev) => prev + 1);

    // Hide loading state after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Show loading state during navigation
  if (isLoading) {
    return <LoadingContent pathname={pathname} key={loadingKey} />;
  }

  return <>{children}</>;
};

/**
 * Renders appropriate loading content based on the current pathname
 */
const LoadingContent = ({ pathname }: { pathname: string }) => {
  // Determine which loading component to show based on the route
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

export default LoadingWrapper;
