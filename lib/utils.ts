import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ilike, sql } from "drizzle-orm";
import { videos } from "@/drizzle/schema";
import { DEFAULT_VIDEO_CONFIG, DEFAULT_RECORDING_CONFIG } from "@/constants";

/**
 * Utility to concatenate class names conditionally and merge Tailwind classes without conflicts.
 * 
 * @param inputs - List of class values (string, object, or array) to combine.
 * @returns A single merged string with deduplicated and conflict-resolved class names.
 * 
 * Used throughout the project to simplify dynamic and conditional styling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Updates and formats URL query parameters.
 *
 * - Accepts current URLSearchParams and a set of updates.
 * - Supports adding, updating, or removing query params based on provided values.
 * - Returns the new query string appended to the base path.
 *
 * @param currentParams - Existing URL query parameters.
 * @param updates - Key-value map of parameters to add/remove (removes if value is null/undefined).
 * @param basePath - Optional base path to prepend (defaults to "/").
 * @returns A string with the updated URL & query string.
 *
 * Used in video pagination, filtering, and search throughout the app.
 */
export const updateURLParams = (
  currentParams: URLSearchParams,
  updates: Record<string, string | null | undefined>,
  basePath: string = "/"
): string => {
  const params = new URLSearchParams(currentParams.toString());

  Object.entries(updates).forEach(([name, value]) => {
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
  });

  return `${basePath}?${params.toString()}`;
};

/**
 * Fetches an environment variable and throws an error if undefined.
 *
 * @param key - Environment variable name.
 * @returns The value of the environment variable.
 * @throws If the variable is not set in process.env.
 *
 * Ensures required environment keys (e.g., for Bunny CDN) are enforced at runtime.
 */
export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
};

/**
 * Unified API fetch helper with Bunny CDN authentication.
 * Dynamically assigns proper access key and headers for "stream" or "storage" Bunny APIs.
 * Handles both JSON and non-JSON (delete, no-content) responses.
 *
 * @typeParam T - The expected response data shape.
 * @param url - API endpoint.
 * @param options - Fetch options (see ApiFetchOptions), including bunnyType ("stream" | "storage").
 * @returns Parsed JSON (or boolean for delete/default).
 * @throws On HTTP/network error.
 *
 * Used for all communication with Bunny CDN for uploads, queries, and deletes.
 */
export const apiFetch = async <T = Record<string, unknown>>(
  url: string,
  options: Omit<ApiFetchOptions, "bunnyType"> & {
    bunnyType: "stream" | "storage";
  }
): Promise<T> => {
  const {
    method = "GET",
    headers = {},
    body,
    expectJson = true,
    bunnyType,
  } = options;

  const key = getEnv(
    bunnyType === "stream"
      ? "BUNNY_STREAM_ACCESS_KEY"
      : "BUNNY_STORAGE_ACCESS_KEY"
  );

  const requestHeaders = {
    ...headers,
    AccessKey: key,
    ...(bunnyType === "stream" && {
      accept: "application/json",
      ...(body && { "content-type": "application/json" }),
    }),
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`API error ${response.text()}`);
  }

  if (method === "DELETE" || !expectJson) {
    return true as T;
  }

  return await response.json();
};

/**
 * Higher-order function to wrap async logic with standardized error handling.
 * Converts synchronous or thrown errors into consistent error messages or results.
 *
 * @param fn - The async function to wrap.
 * @returns A new function with the same signature that catches and stringifies thrown errors.
 *
 * Used throughout API utilities to safely manage error surface for UI/state functions.
 */
export const withErrorHandling = <T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>
) => {
  return async (...args: A): Promise<T> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return errorMessage as unknown as T;
    }
  };
};

/**
 * Maps UI-selected video filters to order-by SQL expressions for Drizzle ORM.
 *
 * @param filter - Filter option (e.g., "Most Viewed", "Oldest First").
 * @returns A SQL clause for ordering video queries.
 *
 * Drives sorting logic in the main video library UI and server-side pagination.
 */
export const getOrderByClause = (filter?: string) => {
  switch (filter) {
    case "Most Viewed":
      return sql`${videos.views} DESC`;
    case "Least Viewed":
      return sql`${videos.views} ASC`;
    case "Oldest First":
      return sql`${videos.createdAt} ASC`;
    case "Most Recent":
    default:
      return sql`${videos.createdAt} DESC`;
  }
};

/**
 * Generates an array of pagination controls, adding "..." when needed.
 *
 * @param currentPage - Current active page number.
 * @param totalPages - Total number of pages.
 * @returns An array of page indicators (numbers and/or "...").
 *
 * Used to render intelligent pageable navigation across potentially large video listings.
 */
export const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

/**
 * Requests screen (display) and optionally microphone (mic) streams for recording or sharing.
 *
 * - Uses browser MediaDevices APIs.
 * - Allows toggling mic input; returns both streams and whether display has audio.
 *
 * @param withMic - If true, includes microphone input.
 * @returns Promise that resolves to MediaStreams object.
 * 
 * Central to enabling user-driven video/screen recording functionality.
 */
export const getMediaStreams = async (
  withMic: boolean
): Promise<MediaStreams> => {
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: DEFAULT_VIDEO_CONFIG,
    audio: true,
  });

  const hasDisplayAudio = displayStream.getAudioTracks().length > 0;
  let micStream: MediaStream | null = null;

  if (withMic) {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream
      .getAudioTracks()
      .forEach((track: MediaStreamTrack) => (track.enabled = true));
  }

  return { displayStream, micStream, hasDisplayAudio };
};

/**
 * Combines display and microphone audio tracks into a single stream via an AudioContext.
 *
 * @param ctx - The shared AudioContext instance.
 * @param displayStream - The display/screen MediaStream.
 * @param micStream - The microphone MediaStream (if active).
 * @param hasDisplayAudio - Whether display has active audio tracks.
 * @returns The mixed MediaStreamAudioDestinationNode or null if nothing to mix.
 *
 * Required for merging audio sources before recording or broadcasting.
 */
export const createAudioMixer = (
  ctx: AudioContext,
  displayStream: MediaStream,
  micStream: MediaStream | null,
  hasDisplayAudio: boolean
) => {
  if (!hasDisplayAudio && !micStream) return null;

  const destination = ctx.createMediaStreamDestination();
  const mix = (stream: MediaStream, gainValue: number) => {
    const source = ctx.createMediaStreamSource(stream);
    const gain = ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(gain).connect(destination);
  };

  if (hasDisplayAudio) mix(displayStream, 0.7);
  if (micStream) mix(micStream, 1.5);

  return destination;
};

/**
 * Safely creates a MediaRecorder instance with fallback.
 * Tries to use the recommended config; falls back to browser default if unsupported.
 *
 * @param stream - The MediaStream to record.
 * @returns Initialized MediaRecorder.
 *
 * Ensures consistent recording regardless of browser differences.
 */
export const setupMediaRecorder = (stream: MediaStream) => {
  try {
    return new MediaRecorder(stream, DEFAULT_RECORDING_CONFIG);
  } catch {
    return new MediaRecorder(stream);
  }
};

/**
 * Calculates and returns video duration in seconds from a remote/local URL.
 * Loads video metadata without downloading the entire file.
 *
 * @param url - The video resource URL.
 * @returns Promise resolving to video duration in seconds, or null if unavailable.
 *
 * Used for preview/validation when uploading or recording videos.
 */
export const getVideoDuration = (url: string): Promise<number | null> =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration =
        isFinite(video.duration) && video.duration > 0
          ? Math.round(video.duration)
          : null;
      URL.revokeObjectURL(video.src);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };
    video.src = url;
  });

/**
 * Instantiates and wires MediaRecorder event handlers for a given MediaStream.
 *
 * @param stream - The recording-ready stream (possibly mixed).
 * @param handlers - onDataAvailable and onStop event handlers.
 * @returns Initialized MediaRecorder instance.
 *
 * Used for implementing video/screen recording UI block.
 */
export const setupRecording = (
  stream: MediaStream,
  handlers: RecordingHandlers
): MediaRecorder => {
  const recorder = new MediaRecorder(stream, DEFAULT_RECORDING_CONFIG);
  recorder.ondataavailable = handlers.onDataAvailable;
  recorder.onstop = handlers.onStop;
  return recorder;
};

/**
 * Stops and cleans up recording streams and resources.
 * - Stops recorder if not already inactive.
 * - Stops all tracks of the recording and original streams.
 *
 * @param recorder - The MediaRecorder object (if active).
 * @param stream - The main MediaStream.
 * @param originalStreams - All subsidiary streams to cleanup.
 *
 * Prevents memory leaks or zombie processes after user leaves a recording.
 */
export const cleanupRecording = (
  recorder: MediaRecorder | null,
  stream: MediaStream | null,
  originalStreams: MediaStream[] = []
) => {
  if (recorder?.state !== "inactive") {
    recorder?.stop();
  }

  stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  originalStreams.forEach((s) =>
    s.getTracks().forEach((track: MediaStreamTrack) => track.stop())
  );
};

/**
 * Builds a downloadable blob and object URL from recording video chunks.
 *
 * @param chunks - Array of Blob chunks from the recording session.
 * @returns An object with the final Blob and a local object URL.
 *
 * Used after recording to preview, download, or upload the video.
 */
export const createRecordingBlob = (
  chunks: Blob[]
): { blob: Blob; url: string } => {
  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  return { blob, url };
};

/**
 * Computes the elapsed recording time in full seconds from a start timestamp.
 *
 * @param startTime - Recording start time (ms).
 * @returns Number of seconds elapsed, or 0 if startTime is falsy.
 *
 * For UI live recording duration display.
 */
export const calculateRecordingDuration = (startTime: number | null): number =>
  startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

/**
 * Parses a WebVTT (subtitle/transcript) string into structured transcript entries.
 * Supports typical WEBVTT formatting and time splits.
 *
 * @param transcript - The subtitle/transcript data string.
 * @returns An array of entries with time and text for rendering transcript overlays.
 *
 * Used to support subtitle search, display, and clickable navigation in the video player.
 */
export function parseTranscript(transcript: string): TranscriptEntry[] {
  const lines = transcript.replace(/^WEBVTT\s*/, "").split("\n");
  const result: TranscriptEntry[] = [];
  let tempText: string[] = [];
  let startTime: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const timeMatch = trimmedLine.match(
      /(\d{2}:\d{2}:\d{2})\.\d{3}\s-->\s(\d{2}:\d{2}:\d{2})\.\d{3}/
    );

    if (timeMatch) {
      if (tempText.length > 0 && startTime) {
        result.push({ time: startTime, text: tempText.join(" ") });
        tempText = [];
      }
      startTime = timeMatch[1] ?? null;
    } else if (trimmedLine) {
      tempText.push(trimmedLine);
    }

    if (tempText.length >= 3 && startTime) {
      result.push({ time: startTime, text: tempText.join(" ") });
      tempText = [];
      startTime = null;
    }
  }

  if (tempText.length > 0 && startTime) {
    result.push({ time: startTime, text: tempText.join(" ") });
  }

  return result;
}

/**
 * Returns a human-readable string indicating how many days ago a given date was.
 *
 * @param inputDate - The reference date.
 * @returns "Today", "1 day ago", or "X days ago".
 *
 * Used in video card/metadata display.
 */
export function daysAgo(inputDate: Date): string {
  const input = new Date(inputDate);
  const now = new Date();

  const diffTime = now.getTime() - input.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day ago";
  } else {
    return `${diffDays} days ago`;
  }
}

/**
 * Returns the embed URL for a video for use in <iframe> elements.
 *
 * @param videoId - The video identifier (as known to CDN).
 * @returns Full URL for embedding and autoplaying the video.
 *
 * Enables sharing, embedding, and previewing of content.
 */
export const createIframeLink = (videoId: string) =>
  `https://iframe.mediadelivery.net/embed/515533/${videoId}?autoplay=true&preload=true`;

/**
 * Produces a case-insensitive, normalized wildcard query for video titles.
 * Removes special characters and searches via ilike (SQL).
 *
 * @param videos - The videos database table reference.
 * @param searchQuery - Raw search string.
 * @returns A SQL ilike clause for matching video titles.
 *
 * Supports video search functionality in the public library and search pages.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const doesTitleMatch = (videos: any, searchQuery: string) =>
  ilike(
    sql`REPLACE(REPLACE(REPLACE(LOWER(${videos.title}), '-', ''), '.', ''), ' ', '')`,
    `%${searchQuery.replace(/[-. ]/g, "").toLowerCase()}%`
  );