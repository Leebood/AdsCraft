'use client';

import { useCallback, useState } from 'react';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

export type ScreenshotPlatform = 'facebook' | 'tiktok' | 'google';

export interface ScreenshotAnalysisResult {
  platform_detected?: ScreenshotPlatform;
  platform_selected?: string;
  campaign_name?: string | null;
  snapshot_date?: string | null;
  spend?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  cpc?: number | null;
  conversions?: number | null;
  cpa?: number | null;
  roas?: number | null;
  [key: string]: unknown;
}

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const COMPRESS_THRESHOLD = 4.5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1800;
const JPEG_QUALITY = 0.82;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const PLATFORM_NAMES: Record<ScreenshotPlatform, string> = {
  facebook: 'Facebook',
  tiktok: 'TikTok',
  google: 'Google Ads',
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

async function compressScreenshot(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD) {
    return file;
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return file;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas);
  if (blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'screenshot';
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export function useScreenshotAnalysis(platform: ScreenshotPlatform) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platformWarning, setPlatformWarning] = useState<string | null>(null);

  const selectFile = useCallback(async (selectedFile: File) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setPreview(null);
      setError('Please upload a JPG, PNG, or WEBP image');
      return;
    }

    try {
      const preparedFile = await compressScreenshot(selectedFile);
      if (preparedFile.size > MAX_UPLOAD_SIZE) {
        setFile(null);
        setPreview(null);
        setError('Image size cannot exceed 10MB');
        return;
      }

      setError(null);
      setFile(preparedFile);
      setPreview(await readFileAsDataUrl(preparedFile));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image preparation failed');
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    setPlatformWarning(null);
  }, []);

  const uploadAndAnalyze = useCallback(async (): Promise<ScreenshotAnalysisResult | null> => {
    if (!file) return null;

    setUploading(true);
    setError(null);

    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();

      if (!session) {
        setError('Please login first');
        return null;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('platform', platform);

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
        headers: {
          'x-session': session.access_token,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Screenshot recognition failed');
      }

      const platformDetected = result.platform_detected as ScreenshotPlatform | undefined;
      if (platformDetected && platformDetected !== platform) {
        setPlatformWarning(
          `Detected ${PLATFORM_NAMES[platformDetected] || platformDetected} screenshot, but you selected ${PLATFORM_NAMES[platform]}. Please upload the correct platform screenshot.`
        );
      } else {
        setPlatformWarning(null);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recognition failed, please try again');
      return null;
    } finally {
      setUploading(false);
    }
  }, [file, platform]);

  return {
    file,
    preview,
    uploading,
    error,
    platformWarning,
    setError,
    selectFile,
    clearFile,
    uploadAndAnalyze,
  };
}
