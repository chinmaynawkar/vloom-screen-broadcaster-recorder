"use client";

import { cn, createIframeLink } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  incrementVideoViews,
  getVideoProcessingStatus,
} from "@/lib/actions/video";
import { initialVideoState } from "@/constants";

const VideoPlayer = ({ videoId, className }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState(initialVideoState);
  const [loadingDots, setLoadingDots] = useState("");

  // Animated loading dots effect
  useEffect(() => {
    if (!state.isProcessing) return;

    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [state.isProcessing]);

  useEffect(() => {
    const checkProcessingStatus = async () => {
      const status = await getVideoProcessingStatus(videoId);
      setState((prev) => ({
        ...prev,
        isProcessing: !status.isProcessed,
      }));

      return status.isProcessed;
    };

    checkProcessingStatus();

    const intervalId = setInterval(async () => {
      const isProcessed = await checkProcessingStatus();
      if (isProcessed) {
        clearInterval(intervalId);
      }
    }, 3000);
    return () => {
      clearInterval(intervalId);
    };
  }, [videoId]);

  useEffect(() => {
    if (state.isLoaded && !state.hasIncrementedView && !state.isProcessing) {
      const incrementView = async () => {
        try {
          await incrementVideoViews(videoId);
          setState((prev) => ({ ...prev, hasIncrementedView: true }));
        } catch (error) {
          console.error("Failed to increment view count:", error);
        }
      };

      incrementView();
    }
  }, [videoId, state.isLoaded, state.hasIncrementedView, state.isProcessing]);

  return (
    <div className={cn("video-player", className)}>
      {state.isProcessing ? (
        <div className="video-loading-state">
          <div className="loading-content">
            {/* Animated icon */}
            <div className="loading-icon-wrapper">
              <svg
                className="loading-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M12 4V2C6.48 2 2 6.48 2 12H4C4 7.59 7.59 4 12 4Z"
                  fill="currentColor"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
            </div>

            {/* Loading text */}
            <div className="loading-text-wrapper">
              <h3 className="loading-title">
                Preparing your video{loadingDots}
              </h3>
              <p className="loading-subtitle">
                This usually takes a few seconds
              </p>
            </div>

            {/* Progress bar */}
            <div className="loading-progress-bar">
              <div className="loading-progress-fill" />
            </div>
          </div>

          {/* Background shimmer effect */}
          <div className="skeleton-shimmer" />
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={createIframeLink(videoId)}
          loading="lazy"
          title="Video player"
          style={{ border: 0, zIndex: 50 }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setState((prev) => ({ ...prev, isLoaded: true }))}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
