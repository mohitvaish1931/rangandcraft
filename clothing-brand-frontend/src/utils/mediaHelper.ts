/**
 * Media loading utility for handling images and videos with fallbacks
 */
import { API_BASE_URL } from './api';

// Self-contained placeholder (the old via.placeholder.com service is gone).
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="#f2eadd"/><path d="M200 210c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 64c-13 0-24-11-24-24s11-24 24-24 24 11 24 24-11 24-24 24z" fill="#d6cab9"/></svg>'
  );

export const getImageUrl = (imageUrl: string | undefined, width?: number): string => {
  if (!imageUrl) return PLACEHOLDER_IMAGE;
  
  // Apply Cloudinary optimizations if it's a Cloudinary URL
  if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
    if (!imageUrl.includes('/upload/c_')) {
      const transform = width ? `c_scale,w_${width},q_auto,f_auto` : `q_auto,f_auto`;
      return imageUrl.replace('/upload/', `/upload/${transform}/`);
    }
  }

  // If it's already a full URL or Base64 data, return as-is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Backwards compatibility for relative paths if any remain
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
    const baseUrl = API_BASE_URL;
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${cleanUrl}`;
  }
  
  // Otherwise treat as relative path
  return imageUrl;
};

export const getVideoUrl = (videoUrl: string | undefined): string | null => {
  if (!videoUrl) return null;
  
  // Check if it's a YouTube or Vimeo embed URL
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    // Convert to embed format if needed
    if (videoUrl.includes('watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return videoUrl;
  }
  
  if (videoUrl.includes('vimeo.com')) {
    if (!videoUrl.includes('player.vimeo')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoUrl;
  }
  
  // If it's a direct video file, construct full URL if needed
  if (videoUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${videoUrl}`;
  }
  
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }
  
  return videoUrl;
};

export const isVideoEmbedUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || 
         url.includes('youtu.be') || 
         url.includes('vimeo.com') ||
         url.includes('player.vimeo');
};

export const isDirectVideoUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.endsWith('.mp4') || 
         url.endsWith('.webm') || 
         url.endsWith('.ogg') ||
         url.includes('/uploads/');
};

/**
 * Validation helper for file uploads
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (file.size > maxSize) {
    return { valid: false, error: `Image must be less than 10MB (currently ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
  }
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: `Image type not supported. Use JPEG, PNG, WebP, or GIF` };
  }
  
  return { valid: true };
};

export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (file.size > maxSize) {
    return { valid: false, error: `Video must be less than 100MB (currently ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
  }
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: `Video type not supported. Use MP4, WebM, or OGG` };
  }
  
  return { valid: true };
};

/**
 * Handle image load errors with fallback
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== PLACEHOLDER_IMAGE) img.src = PLACEHOLDER_IMAGE;
};

export const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
  console.error('Video failed to load:', event.currentTarget.src);
  event.currentTarget.poster = PLACEHOLDER_IMAGE;
};
