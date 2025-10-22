# Loading System Documentation

## Overview

This document describes the comprehensive loading system implemented to address the 3-4 second loading delays and improve user experience across the Vloom application.

## Components

### 1. LoadingShimmer Component (`components/LoadingShimmer.tsx`)

A reusable loading shimmer component with multiple variants:

- **Base Component**: `LoadingShimmer` - Generic shimmer with customizable props
- **VideoCardShimmer**: Shimmer for video card grids
- **StatsShimmer**: Shimmer for statistics cards
- **PageContentShimmer**: Full page loading shimmer
- **UploadFormShimmer**: Upload form loading state
- **ProfileShimmer**: Profile page loading state

**Usage:**

```tsx
import { LoadingShimmer, VideoCardShimmer } from "@/components";

// Basic shimmer
<LoadingShimmer variant="card" className="w-full h-32" />

// Video grid shimmer
<VideoCardShimmer count={8} />
```

### 2. Loading Context (`lib/contexts/LoadingContext.tsx`)

Global loading state management:

```tsx
import { useLoadingContext } from "@/lib/contexts/LoadingContext";

const { isLoading, loadingMessage, startLoading, stopLoading } =
  useLoadingContext();
```

### 3. Loading Hooks (`lib/hooks/useLoading.ts`)

Custom hooks for managing loading states:

- `useLoading()`: Basic loading state management
- `useAsyncLoading()`: Async operation loading wrapper

### 4. Navigation Loading (`lib/hooks/useNavigationLoading.ts`)

Handles loading states during navigation:

```tsx
import { useNavigationLoading } from "@/lib/hooks/useNavigationLoading";

const { navigateWithLoading, replaceWithLoading } = useNavigationLoading();
```

### 5. LoadingButton Component (`components/LoadingButton.tsx`)

Button component with built-in loading states:

```tsx
<LoadingButton
  isLoading={isSubmitting}
  loadingText="Uploading..."
  variant="primary"
  size="lg"
>
  Upload Video
</LoadingButton>
```

## Implementation Details

### Page-Level Loading States

All major pages now use Suspense boundaries with appropriate loading fallbacks:

1. **Home Page** (`app/(root)/page.tsx`)

   - Uses `PageContentShimmer` as fallback
   - Wraps data fetching in Suspense

2. **Upload Page** (`app/(root)/upload/page.tsx`)

   - Uses `UploadFormShimmer` as fallback
   - Implements progressive loading messages during upload

3. **Profile Page** (`app/(root)/profile/[id]/page.tsx`)

   - Uses `ProfileShimmer` as fallback
   - Shows loading state while fetching user data

4. **Video Detail Page** (`app/(root)/video/[videoId]/page.tsx`)
   - Uses `VideoDetailShimmer` as fallback
   - Handles video and transcript loading

### Global Loading Overlay

The `GlobalLoadingOverlay` component provides:

- Full-screen loading overlay during navigation
- Animated loading spinner
- Customizable loading messages
- Glassmorphism design matching the app's aesthetic

### CSS Animations

Added shimmer animations to `globals.css`:

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(100, 116, 139, 0.08) 0%,
    rgba(100, 116, 139, 0.15) 50%,
    rgba(100, 116, 139, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}
```

## Performance Optimizations

### 1. Suspense Boundaries

- Wrapped all data-fetching components in Suspense
- Provides immediate loading feedback
- Prevents layout shifts

### 2. Progressive Loading

- Upload process shows different loading messages
- Navigation shows contextual loading states
- Immediate visual feedback on user interaction

### 3. Optimized Loading States

- Shimmer components match actual content layout
- Reduces perceived loading time
- Maintains visual consistency

## Usage Examples

### Basic Loading State

```tsx
import { useLoading } from "@/lib/hooks/useLoading";

const MyComponent = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleAsyncOperation = async () => {
    startLoading("Processing...");
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };
};
```

### Navigation with Loading

```tsx
import { useNavigationLoading } from "@/lib/hooks/useNavigationLoading";

const NavigationComponent = () => {
  const { navigateWithLoading } = useNavigationLoading();

  const handleNavigation = () => {
    navigateWithLoading("/profile/123", "Loading profile...");
  };
};
```

### Form Submission with Loading

```tsx
import LoadingButton from "@/components/LoadingButton";

const FormComponent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <LoadingButton
      type="submit"
      isLoading={isSubmitting}
      loadingText="Submitting..."
    >
      Submit Form
    </LoadingButton>
  );
};
```

## Benefits

1. **Immediate Feedback**: Users see loading states instantly
2. **Reduced Perceived Loading Time**: Shimmer effects make waits feel shorter
3. **Consistent UX**: All loading states follow the same design patterns
4. **Progressive Enhancement**: Loading states improve without breaking functionality
5. **Accessibility**: Loading states provide clear feedback to all users

## Maintenance

- All loading components are modular and reusable
- Loading states are centralized through context
- Easy to add new loading variants
- Consistent styling through design system integration
