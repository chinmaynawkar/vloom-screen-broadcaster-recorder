"use client";

/**
 * Upload page for videos. Handles video, thumbnail and form data upload.
 * Uses hooks to manage file input states and submittal flow.
 */
import { useState, FormEvent, ChangeEvent, useEffect, Suspense } from "react";
import {
  getVideoUploadUrl,
  getThumbnailUploadUrl,
  saveVideoDetails,
} from "@/lib/actions/video";
import { useRouter } from "next/navigation";
import { FileInput, FormField, UploadFormShimmer } from "@/components";
import LoadingButton from "@/components/LoadingButton";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { useLoadingContext } from "@/lib/contexts/LoadingContext";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";

/**
 * Uploads a file to Bunny CDN using provided uploadUrl and accessKey.
 * Throws error if upload fails.
 * @param file The file to upload.
 * @param uploadUrl The CDN pre-signed upload URL.
 * @param accessKey Access key for authentication.
 */
const uploadFileToBunny = (
  file: File,
  uploadUrl: string,
  accessKey: string
): Promise<void> =>
  fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      AccessKey: accessKey,
    },
    body: file,
  }).then((response) => {
    if (!response.ok)
      throw new Error(`Upload failed with status ${response.status}`);
  });

/**
 * Main page for uploading a video and its metadata.
 * Handles form state, file inputs, upload logic, and error display.
 */
const UploadPage = () => {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [formData, setFormData] = useState<VideoFormValues>({
    title: "",
    description: "",
    tags: "",
    visibility: "public",
  });
  const video = useFileInput(MAX_VIDEO_SIZE);
  /** File input hook for thumbnail */
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

  /**
   * Update video duration if changed.
   */
  useEffect(() => {
    if (video.duration !== null) {
      setVideoDuration(video.duration);
    }
  }, [video.duration]);

  /**
   * Loads a locally recorded video from sessionStorage, if available.
   * Useful for workflows that involve recording a new video in-browser.
   */
  useEffect(() => {
    const checkForRecordedVideo = async () => {
      try {
        // Try loading a previously recorded video from sessionStorage (e.g. after a screen recording workflow)
        const stored = sessionStorage.getItem("recordedVideo");
        if (!stored) return;

        // Parse the saved metadata for the recorded video (URL, filename, MIME type, duration)
        const { url, name, type, duration } = JSON.parse(stored);

        // Download the Blob from its object URL so we can create a real File instance
        const blob = await fetch(url).then((res) => res.blob());
        // Wrap the blob data in a File object to simulate a user file upload
        const file = new File([blob], name, { type, lastModified: Date.now() });

        if (video.inputRef.current) {
          // Simulate a manual file input: make a DataTransfer containing the new File
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          // Assign the file to the file input field
          video.inputRef.current.files = dataTransfer.files;

          // Dispatch a change event to trigger native input updates and React handler
          const event = new Event("change", { bubbles: true });
          video.inputRef.current.dispatchEvent(event);

          // Also call our custom file change handler for hook state update
          video.handleFileChange({
            target: { files: dataTransfer.files },
          } as ChangeEvent<HTMLInputElement>);
        }

        // Restore the duration if it was saved with the recording
        if (duration) setVideoDuration(duration);

        // Clean up: remove the entry and revoke the Blob URL to free memory
        sessionStorage.removeItem("recordedVideo");
        URL.revokeObjectURL(url);
      } catch (err) {
        // Log any unexpected errors in the loading process
        console.error("Error loading recorded video:", err);
      }
    };

    checkForRecordedVideo();
  }, [video]);

  /**
   * Handles change in input fields for form data.
   * @param e Input change event for title, description, etc.
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles form submission. Uploads video and thumbnail,
   * saves video metadata, then redirects to video page.
   * Sets error if any step fails.
   */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    startLoading("Uploading video...");

    try {
      if (!video.file || !thumbnail.file) {
        setError("Please upload video and thumbnail files.");
        return;
      }

      if (!formData.title || !formData.description) {
        setError("Please fill in all required fields.");
        return;
      }

      startLoading("Preparing upload...");
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = await getVideoUploadUrl();

      if (!videoUploadUrl || !videoAccessKey)
        throw new Error("Failed to get video upload credentials");

      startLoading("Uploading video file...");
      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      startLoading("Uploading thumbnail...");
      const {
        uploadUrl: thumbnailUploadUrl,
        cdnUrl: thumbnailCdnUrl,
        accessKey: thumbnailAccessKey,
      } = await getThumbnailUploadUrl(videoId);

      if (!thumbnailUploadUrl || !thumbnailCdnUrl || !thumbnailAccessKey)
        throw new Error("Failed to get thumbnail upload credentials");

      await uploadFileToBunny(
        thumbnail.file,
        thumbnailUploadUrl,
        thumbnailAccessKey
      );

      startLoading("Saving video details...");
      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCdnUrl,
        ...formData,
        duration: videoDuration,
      });

      startLoading("Redirecting...");
      router.push(`/video/${videoId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <main className="upload-page">
      <div className="overlay" />

      {/* Hero Section */}
      <div className="upload-hero">
        <div className="wrapper">
          <h1>Share Your Story</h1>
          <p>
            Upload your video and reach viewers around the world. Add details to
            help people discover your content.
          </p>
        </div>
      </div>

      {/* Upload Form Container */}
      <div className="upload-container">
        {error && <div className="error-field">{error}</div>}
        <form onSubmit={onSubmit}>
          <FormField
            id="title"
            label="Title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a clear and concise video title"
          />

          <FormField
            id="description"
            label="Description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Briefly describe what this video is about"
            as="textarea"
          />

          <FileInput
            id="video"
            label="Video"
            accept="video/*"
            file={video.file}
            previewUrl={video.previewUrl}
            inputRef={video.inputRef}
            onChange={video.handleFileChange}
            onReset={video.resetFile}
            type="video"
          />

          <FileInput
            id="thumbnail"
            label="Thumbnail"
            accept="image/*"
            file={thumbnail.file}
            previewUrl={thumbnail.previewUrl}
            inputRef={thumbnail.inputRef}
            onChange={thumbnail.handleFileChange}
            onReset={thumbnail.resetFile}
            type="image"
          />

          <FormField
            id="visibility"
            label="Visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            as="select"
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ]}
          />

          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Uploading..."
            className="submit-button w-full"
            variant="primary"
            size="lg"
          >
            Upload Video
          </LoadingButton>
        </form>
      </div>
    </main>
  );
};

const UploadPageWrapper = () => {
  return (
    <Suspense fallback={<UploadFormShimmer />}>
      <UploadPage />
    </Suspense>
  );
};

export default UploadPageWrapper;
