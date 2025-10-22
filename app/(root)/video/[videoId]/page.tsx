import { redirect } from "next/navigation";
import { Suspense } from "react";

import { VideoDetailHeader, VideoInfo, VideoPlayer } from "@/components";
import { getTranscript, getVideoById } from "@/lib/actions/video";
import VideoDetailShimmer from "@/components/VideoDetailShimmer";

const VideoDetailContent = async ({ params }: Params) => {
  const { videoId } = await params;

  const { user, video } = await getVideoById(videoId);
  if (!video) redirect("/404");

  const transcript = await getTranscript(videoId);

  return (
    <div className="wrapper page">
      <VideoDetailHeader
        title={video.title}
        createdAt={video.createdAt}
        userImg={user?.image}
        username={user?.name}
        videoId={video.videoId}
        ownerId={video.userId}
        visibility={video.visibility}
        thumbnailUrl={video.thumbnailUrl}
      />

      <section className="video-details">
        <div className="content">
          <VideoPlayer videoId={video.videoId} />
        </div>

        <VideoInfo
          transcript={transcript}
          title={video.title}
          createdAt={video.createdAt}
          description={video.description}
          videoId={videoId}
          videoUrl={video.videoUrl}
        />
      </section>
    </div>
  );
};

const page = async ({ params }: Params) => {
  return (
    <Suspense fallback={<VideoDetailShimmer />}>
      <VideoDetailContent params={params} />
    </Suspense>
  );
};

export default page;
