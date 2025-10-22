import {
  EmptyState,
  Pagination,
  SharedHeader,
  VideoCard,
  PageContentShimmer,
} from "@/components";
import { getAllVideos } from "@/lib/actions/video";
import Image from "next/image";
import { Suspense } from "react";

// Component for the main content that can be wrapped in Suspense
const HomePageContent = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; filter?: string; page?: string }>;
}) => {
  const { query, filter, page } = await searchParams;

  const { videos, pagination } = await getAllVideos(
    query,
    filter,
    Number(page) || 1
  );

  // Calculate stats (you can make these dynamic later)
  const totalVideos = pagination?.totalVideos || videos?.length || 0;
  const totalViews =
    videos?.reduce((acc, { video }) => acc + video.views, 0) || 0;
  const publicVideos =
    videos?.filter(({ video }) => video.visibility === "public").length || 0;

  return (
    <main className="page">
      <div className="overlay" />

      {/* Hero Section with Stats */}
      <section className="hero-section">
        <div className="decorative-grid" />
        <div className="wrapper">
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-accent-200 uppercase tracking-wider">
                Public Library
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-dark-100 max-w-3xl leading-tight">
                Discover Amazing Video Content
              </h1>
              <p className="text-lg text-dark-200 max-w-2xl font-medium">
                Explore a curated collection of videos from creators around the
                world. Record, share, and engage with the community.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid mt-8">
              <div className="stat-card">
                <Image
                  src="/assets/icons/video.svg"
                  alt="Videos"
                  width={48}
                  height={48}
                  className="stat-icon"
                />
                <h3>Total Videos</h3>
                <p>{totalVideos}</p>
              </div>

              <div className="stat-card">
                <Image
                  src="/assets/icons/eye.svg"
                  alt="Views"
                  width={48}
                  height={48}
                  className="stat-icon"
                />
                <h3>Total Views</h3>
                <p>{totalViews.toLocaleString()}</p>
              </div>

              <div className="stat-card">
                <Image
                  src="/assets/icons/star.svg"
                  alt="Public"
                  width={48}
                  height={48}
                  className="stat-icon"
                />
                <h3>Public Videos</h3>
                <p>{publicVideos}</p>
              </div>

              <div className="stat-card">
                <Image
                  src="/assets/icons/smiley.svg"
                  alt="Creators"
                  width={48}
                  height={48}
                  className="stat-icon"
                />
                <h3>Active Creators</h3>
                <p>{new Set(videos?.map(({ user }) => user?.id)).size || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="content-section">
        <div className="wrapper">
          {/* Search and Filter Header */}
          <SharedHeader subHeader="" title="" />

          {/* Section Header */}
          <div className="section-header">
            <h2>
              {query
                ? `Search Results for "${query}"`
                : filter
                  ? `${filter} Videos`
                  : "All Videos"}
            </h2>
            {videos?.length > 0 && (
              <p className="text-sm text-gray-100">
                Showing {videos.length}{" "}
                {videos.length === 1 ? "video" : "videos"}
              </p>
            )}
          </div>

          {/* Video Grid */}
          {videos?.length > 0 ? (
            <section className="video-grid">
              {videos.map(({ video, user }, index) => (
                <div key={video.id} className="relative">
                  {index < 3 && !query && !filter && (
                    <div className="featured-badge">Featured</div>
                  )}
                  <VideoCard
                    id={video.videoId}
                    title={video.title}
                    thumbnail={video.thumbnailUrl}
                    createdAt={video.createdAt}
                    userImg={user?.image ?? ""}
                    username={user?.name ?? "Guest"}
                    views={video.views}
                    visibility={video.visibility}
                    duration={video.duration}
                  />
                </div>
              ))}
            </section>
          ) : (
            <EmptyState
              icon="/assets/icons/video.svg"
              title="No Videos Found"
              description="Try adjusting your search or check back later for new content."
            />
          )}

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              queryString={query}
              filterString={filter}
            />
          )}
        </div>
      </section>
    </main>
  );
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; filter?: string; page?: string }>;
}) => {
  return (
    <Suspense fallback={<PageContentShimmer />}>
      <HomePageContent searchParams={searchParams} />
    </Suspense>
  );
};

export default page;
