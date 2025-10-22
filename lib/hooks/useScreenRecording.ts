import { useState, useRef, useEffect } from "react";
import {
  getMediaStreams,
  createAudioMixer,
  setupRecording,
  cleanupRecording,
  createRecordingBlob,
  calculateRecordingDuration,
} from "@/lib/utils";

/**
 * Custom React hook for screen and audio recording functionality.
 *
 * This hook manages the screen recording state and logic,
 * including starting, stopping, and resetting a recording.
 * It internally manages media stream acquisition, audio mixing,
 * MediaRecorder instance, and cleanup of all relevant resources.
 *
 * State managed:
 * - isRecording (boolean): Indicates if recording is in progress.
 * - recordedBlob (Blob|null): The final recorded media as a Blob, or null if not recorded.
 * - recordedVideoUrl (string): An object URL for the recorded video, or "" if not recorded.
 * - recordingDuration (number): Duration of the last recording in ms (milliseconds).
 *
 * Returned API:
 * - isRecording: See above.
 * - recordedBlob: See above.
 * - recordedVideoUrl: See above.
 * - recordingDuration: See above.
 * - startRecording(withMic?: boolean): Start a new screen (and optionally audio/mic) recording.
 * - stopRecording(): Stop the current recording, finalize the media, and update state.
 * - resetRecording(): Stop and clear the current recording and all state.
 *
 * Dependencies: Uses functions from "@/lib/utils" for stream, mixing, and recording utilities.
 *
 *
 * @returns {Object} An object with recording state and controlling methods as listed above.
 */
export const useScreenRecording = () => {
  const [state, setState] = useState<BunnyRecordingState>({
    isRecording: false,
    recordedBlob: null,
    recordedVideoUrl: "",
    recordingDuration: 0,
  });

  // References to manage underlying recording and media state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<ExtendedMediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Effect to cleanup on unmount only.
   * Ensures all streams are stopped, resources released and AudioContext closed.
   */
  useEffect(() => {
    return () => {
      stopRecording();
      if (state.recordedVideoUrl) URL.revokeObjectURL(state.recordedVideoUrl);
      // Only close AudioContext if it exists and is not already closed
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run cleanup on unmount

  /**
   * Internally handles the 'stop' event from MediaRecorder.
   * Combines all recording chunks, calculates the duration, and updates state.
   *
   * @private
   */
  const handleRecordingStop = () => {
    const { blob, url } = createRecordingBlob(chunksRef.current);
    const duration = calculateRecordingDuration(startTimeRef.current);

    setState((prev) => ({
      ...prev,
      recordedBlob: blob,
      recordedVideoUrl: url,
      recordingDuration: duration,
      isRecording: false,
    }));
  };

  /**
   * Starts a new screen recording session, with optional microphone audio.
   *
   * This function:
   * - Stops any ongoing recording.
   * - Requests display media and (optionally) microphone stream.
   * - Mixes audio if applicable.
   * - Sets up MediaRecorder and state.
   *
   * @async
   * @param {boolean} [withMic=true] Whether to include the user's microphone audio.
   * @returns {Promise<boolean>} Resolves true if recording started successfully, false on error.
   */
  const startRecording = async (withMic = true): Promise<boolean> => {
    try {
      stopRecording();

      // Close existing AudioContext before creating a new one to prevent memory leaks
      if (audioContextRef.current?.state !== 'closed') {
        await audioContextRef.current?.close().catch(console.error);
      }

      // Acquire media streams (screen, and optionally mic)
      const { displayStream, micStream, hasDisplayAudio } =
        await getMediaStreams(withMic);
      const combinedStream = new MediaStream() as ExtendedMediaStream;

      // Add screen video tracks
      displayStream
        .getVideoTracks()
        .forEach((track: MediaStreamTrack) => combinedStream.addTrack(track));

      // Setup audio mixing context and add audio tracks if any
      audioContextRef.current = new AudioContext();
      const audioDestination = createAudioMixer(
        audioContextRef.current,
        displayStream,
        micStream,
        hasDisplayAudio
      );

      audioDestination?.stream
        .getAudioTracks()
        .forEach((track: MediaStreamTrack) => combinedStream.addTrack(track));

      combinedStream._originalStreams = [
        displayStream,
        ...(micStream ? [micStream] : []),
      ];
      streamRef.current = combinedStream;

      // Setup the MediaRecorder and handlers
      mediaRecorderRef.current = setupRecording(combinedStream, {
        onDataAvailable: (e) => e.data.size && chunksRef.current.push(e.data),
        onStop: handleRecordingStop,
      });

      chunksRef.current = [];
      startTimeRef.current = Date.now();
      mediaRecorderRef.current.start(1000); // Start with 1 second timeslice for dataavailable
      setState((prev) => ({ ...prev, isRecording: true }));
      return true;
    } catch (error) {
      console.error("Recording error:", error);
      return false;
    }
  };

  /**
   * Stops the current recording session if running.
   *
   * - Finalizes MediaRecorder and active streams.
   * - Closes AudioContext to free resources.
   * - Updates state to indicate not recording.
   * - Does NOT clear the recorded video; use resetRecording for full cleanup.
   *
   * @returns {void}
   */
  const stopRecording = (): void => {
    cleanupRecording(
      mediaRecorderRef.current,
      streamRef.current,
      streamRef.current?._originalStreams
    );
    streamRef.current = null;
    
    // Close AudioContext when stopping recording
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close().catch(console.error);
    }
    
    setState((prev) => ({ ...prev, isRecording: false }));
  };

  /**
   * Resets all recording state and blobs.
   *
   * - Stops any current recording and releases all streams.
   * - Revokes the current video object URL to free memory.
   * - Clears recording blob, URL, duration, and resets state.
   *
   * @returns {void}
   */
  const resetRecording = (): void => {
    stopRecording();
    if (state.recordedVideoUrl) URL.revokeObjectURL(state.recordedVideoUrl);
    setState({
      isRecording: false,
      recordedBlob: null,
      recordedVideoUrl: "",
      recordingDuration: 0,
    });
    startTimeRef.current = null;
  };

  // Expose the state and all controller functions
  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
