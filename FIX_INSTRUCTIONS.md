# Video 404 Fix - Setup Instructions

## Problem Fixed

Video player was showing 404 errors because the iframe embed URL was using a hardcoded library ID instead of your actual Bunny CDN library ID.

## What Was Changed

1. **`/lib/utils.ts`** - Updated `createIframeLink()` to use environment variable instead of hardcoded value
2. **`/constants/index.ts`** - Added `LIBRARY_ID` configuration that reads from environment
3. **`/README.md`** - Added new environment variable to documentation

## Required Action: Add Environment Variable

Add this line to your `.env` or `.env.local` file:

```env
NEXT_PUBLIC_BUNNY_LIBRARY_ID=your_library_id_here
```

**How to get your library ID:**

1. Log into your Bunny.net dashboard
2. Go to Stream section
3. Copy your Library ID (it should match your existing `BUNNY_LIBRARY_ID` value)

**Example:**
If your `BUNNY_LIBRARY_ID=421422`, then set:

```env
NEXT_PUBLIC_BUNNY_LIBRARY_ID=421422
```

## After Setup

1. Restart your development server:

   ```bash
   npm run dev
   ```

2. Test by uploading a new video or playing an existing one

3. The video should now play without 404 errors

## Why NEXT*PUBLIC* prefix?

The `VideoPlayer` component runs on the client side and needs access to this value. Next.js only exposes environment variables prefixed with `NEXT_PUBLIC_` to the browser.

## Verification

You can verify the fix is working by:

1. Opening browser DevTools (F12)
2. Go to Network tab
3. Play a video
4. Check the iframe request URL - it should show your correct library ID

---

**Note:** After adding the environment variable, delete this file as it's no longer needed.
