"use client";

import { cn } from "@/lib/utils";

interface LoadingShimmerProps {
  className?: string;
  variant?: "default" | "card" | "video-card" | "stats" | "text" | "button";
  lines?: number;
  width?: string;
  height?: string;
}

/**
 * Reusable loading shimmer component with multiple variants
 * Matches the app's design system with glassmorphism effects
 */
const LoadingShimmer = ({
  className,
  variant = "default",
  lines = 1,
  width,
  height,
}: LoadingShimmerProps) => {
  const baseClasses =
    "animate-pulse bg-gradient-to-r from-gray-20 via-gray-25 to-gray-20 bg-[length:200%_100%]";

  const variantClasses = {
    default: "rounded-2xl",
    card: "rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30",
    "video-card":
      "rounded-2xl bg-white/70 backdrop-blur-sm border border-white/30 aspect-[16/9]",
    stats:
      "rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 p-5",
    text: "rounded-md",
    button: "rounded-4xl",
  };

  const shimmerAnimation = {
    animation: "shimmer 2s ease-in-out infinite",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              "h-4",
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{
              ...shimmerAnimation,
              width: width,
              height: height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        ...shimmerAnimation,
        width: width || "100%",
        height: height || "1rem",
      }}
    />
  );
};

/**
 * Loading shimmer for video cards grid
 */
export const VideoCardShimmer = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="relative">
        <LoadingShimmer variant="video-card" className="w-full aspect-[16/9]" />
        <div className="absolute top-3 left-3">
          <LoadingShimmer variant="text" className="w-16 h-6 rounded-full" />
        </div>
        <div className="absolute top-3 right-3">
          <LoadingShimmer variant="text" className="w-12 h-6 rounded-full" />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <LoadingShimmer variant="text" className="w-full h-4 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Loading shimmer for stats cards
 */
export const StatsShimmer = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, index) => (
      <LoadingShimmer key={index} variant="stats" className="w-full h-24" />
    ))}
  </div>
);

/**
 * Loading shimmer for page content
 */
export const PageContentShimmer = () => (
  <div className="space-y-8">
    {/* Hero section shimmer */}
    <div className="hero-section">
      <div className="wrapper">
        <div className="flex flex-col gap-6">
          <LoadingShimmer variant="text" className="w-32 h-4" />
          <LoadingShimmer variant="text" className="w-96 h-12" />
          <LoadingShimmer variant="text" className="w-80 h-6" />
          <StatsShimmer />
        </div>
      </div>
    </div>

    {/* Content section shimmer */}
    <div className="content-section">
      <div className="wrapper">
        <div className="section-header">
          <LoadingShimmer variant="text" className="w-48 h-8" />
        </div>
        <VideoCardShimmer />
      </div>
    </div>
  </div>
);

/**
 * Loading shimmer for upload form
 */
export const UploadFormShimmer = () => (
  <div className="upload-container">
    <div className="rounded-3xl gap-7 w-full flex flex-col px-10 py-12 bg-white/80 backdrop-blur-sm border border-purple-200/15">
      <LoadingShimmer variant="text" className="w-full h-12" />
      <LoadingShimmer variant="text" className="w-full h-32" />
      <LoadingShimmer variant="card" className="w-full h-48" />
      <LoadingShimmer variant="card" className="w-full h-48" />
      <LoadingShimmer variant="text" className="w-full h-12" />
      <LoadingShimmer variant="button" className="w-full h-12" />
    </div>
  </div>
);

/**
 * Loading shimmer for profile page
 */
export const ProfileShimmer = () => (
  <main className="wrapper page">
    <div className="header">
      <div className="header-container">
        <div className="details">
          <LoadingShimmer variant="card" className="w-16 h-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <LoadingShimmer variant="text" className="w-32 h-6" />
            <LoadingShimmer variant="text" className="w-48 h-4" />
          </div>
        </div>
      </div>
    </div>
    <VideoCardShimmer />
  </main>
);

export default LoadingShimmer;
