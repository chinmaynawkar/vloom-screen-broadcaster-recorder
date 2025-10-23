/**
 * useFileInput - React hook for handling file input in forms
 *
 * Usage context:
 * - Used in upload forms (e.g. uploading videos or thumbnails) throughout the project.
 * - Enforces maximum file size.
 * - For videos, the hook will automatically extract and provide the video's duration.
 * - Handles cleanup of created object URLs to avoid memory leaks.
 *
 * Returns: {
 *   file: File|null,                  // The selected file object
 *   previewUrl: string|null,          // A blob URL for display/preview
 *   duration: number|null,            // Duration (in seconds) for video files, else null
 *   inputRef: React.RefObject,        // Ref for the input element
 *   handleFileChange: function,       // onChange handler for file input
 *   resetFile: function,              // Resets/clears the current file selection
 * }
 *
 * Example:
 *   const videoInput = useFileInput(MAX_VIDEO_SIZE);
 *   <input ref={videoInput.inputRef} onChange={videoInput.handleFileChange} ... />
 */

import { ChangeEvent, useRef, useState } from "react";

export const useFileInput = (maxSize: number) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];


      if (selectedFile.size > maxSize) {
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      
      // Extract duration for video files
      if (selectedFile.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        
        const handleLoadedMetadata = () => {
          // Only set duration if it's a valid finite number
          if (isFinite(video.duration) && video.duration > 0) {
            setDuration(Math.round(video.duration)); // Round to nearest integer
          } else {
            setDuration(null); // Set to null if invalid
          }
          // Clean up
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
          URL.revokeObjectURL(video.src);
        };
        
        const handleError = () => {
          setDuration(null);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
          URL.revokeObjectURL(video.src);
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);
        video.src = objectUrl;
      }
    }
  };

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setDuration(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return { file, previewUrl, duration, inputRef, handleFileChange, resetFile };
};
