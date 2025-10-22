import { LoadingShimmer } from "@/components";

/**
 * Loading shimmer specifically for video detail pages
 */
export const VideoDetailShimmer = () => (
  <main className="wrapper page">
    <div className="video-details">
      <div className="content">
        {/* Video player shimmer */}
        <div className="video-player">
          <LoadingShimmer variant="card" className="w-full h-96 rounded-2xl" />
        </div>

        {/* Video info shimmer */}
        <div className="video-info">
          <div className="space-y-6">
            {/* Title and metadata */}
            <div className="space-y-4">
              <LoadingShimmer variant="text" className="w-3/4 h-8" />
              <div className="flex gap-4">
                <LoadingShimmer variant="text" className="w-24 h-4" />
                <LoadingShimmer variant="text" className="w-32 h-4" />
                <LoadingShimmer variant="text" className="w-20 h-4" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <LoadingShimmer variant="text" className="w-full h-4" />
              <LoadingShimmer variant="text" className="w-5/6 h-4" />
              <LoadingShimmer variant="text" className="w-4/6 h-4" />
            </div>

            {/* Tabs */}
            <div className="flex gap-6">
              <LoadingShimmer variant="text" className="w-16 h-6" />
              <LoadingShimmer variant="text" className="w-20 h-6" />
            </div>

            {/* Content area */}
            <div className="space-y-4">
              <LoadingShimmer variant="text" className="w-full h-4" />
              <LoadingShimmer variant="text" className="w-4/5 h-4" />
              <LoadingShimmer variant="text" className="w-3/5 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default VideoDetailShimmer;
