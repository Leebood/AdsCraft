'use client';

import { useCallback, useState } from 'react';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

export type ScreenshotPlatform = 'facebook' | 'tiktok' | 'google';
export type DetectedScreenshotPlatform = ScreenshotPlatform | 'unknown';
export type ScreenshotLocale = 'en' | 'zh';

export interface ScreenshotAnalysisResult {
  platform_detected?: DetectedScreenshotPlatform;
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

const PLATFORM_NAMES: Record<ScreenshotLocale, Record<DetectedScreenshotPlatform, string>> = {
  en: {
    facebook: 'Facebook Ads',
    tiktok: 'TikTok Ads',
    google: 'Google Ads',
    unknown: 'an unsupported or unrecognized page',
  },
  zh: {
    facebook: 'Facebook 广告',
    tiktok: 'TikTok 广告',
    google: 'Google Ads',
    unknown: '非广告后台或未识别页面',
  },
};

const MESSAGES = {
  en: {
    invalidType: 'Please upload a JPG, PNG, or WEBP image',
    tooLarge: 'Image size cannot exceed 10MB',
    readFailed: 'Failed to read image file',
    loadFailed: 'Failed to load image',
    compressFailed: 'Failed to compress image',
    prepareFailed: 'Image preparation failed',
    loginRequired: 'Please login first',
    screenshotFailed: 'Screenshot recognition failed',
    recognitionFailed: 'Recognition failed, please try again',
    platformMismatch: (detected: string, selected: string) =>
      `Detected ${detected} screenshot, but you selected ${selected}. Please confirm the extracted data or upload the correct platform screenshot.`,
  },
  zh: {
    invalidType: '请上传 JPG、PNG 或 WEBP 图片',
    tooLarge: '图片不能超过 10MB',
    readFailed: '读取图片失败，请重新选择',
    loadFailed: '加载图片失败，请重新选择',
    compressFailed: '压缩图片失败，请重新选择',
    prepareFailed: '图片处理失败，请重新选择',
    loginRequired: '请先登录后再上传截图',
    screenshotFailed: '截图识别失败',
    recognitionFailed: '识别失败，请重试',
    platformMismatch: (detected: string, selected: string) =>
      `系统识别为${detected}截图，但当前选择的是${selected}。你可以核对识别数据，或重新上传对应平台截图。`,
  },
};

function readFileAsDataUrl(file: File, locale: ScreenshotLocale): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = () => reject(new Error(MESSAGES[locale].readFailed));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string, locale: ScreenshotLocale): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(MESSAGES[locale].loadFailed));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, locale: ScreenshotLocale): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(MESSAGES[locale].compressFailed));
        }
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

async function compressScreenshot(file: File, locale: ScreenshotLocale): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD) {
    return file;
  }

  const dataUrl = await readFileAsDataUrl(file, locale);
  const image = await loadImage(dataUrl, locale);
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

  const blob = await canvasToBlob(canvas, locale);
  if (blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'screenshot';
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export function useScreenshotAnalysis(platform: ScreenshotPlatform, locale: ScreenshotLocale = 'en') {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platformWarning, setPlatformWarning] = useState<string | null>(null);

  const selectFile = useCallback(async (selectedFile: File) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setPreview(null);
      setError(MESSAGES[locale].invalidType);
      return;
    }

    try {
      const preparedFile = await compressScreenshot(selectedFile, locale);
      if (preparedFile.size > MAX_UPLOAD_SIZE) {
        setFile(null);
        setPreview(null);
        setError(MESSAGES[locale].tooLarge);
        return;
      }

      setError(null);
      setPlatformWarning(null);
      setFile(preparedFile);
      setPreview(await readFileAsDataUrl(preparedFile, locale));
    } catch (err) {
      setError(err instanceof Error ? err.message : MESSAGES[locale].prepareFailed);
    }
  }, [locale]);

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
        setError(MESSAGES[locale].loginRequired);
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
        throw new Error(result.error || MESSAGES[locale].screenshotFailed);
      }

      const platformDetected = result.platform_detected as DetectedScreenshotPlatform | undefined;
      if (platformDetected && platformDetected !== platform) {
        setPlatformWarning(
          MESSAGES[locale].platformMismatch(
            PLATFORM_NAMES[locale][platformDetected] || platformDetected,
            PLATFORM_NAMES[locale][platform]
          )
        );
      } else {
        setPlatformWarning(null);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : MESSAGES[locale].recognitionFailed);
      return null;
    } finally {
      setUploading(false);
    }
  }, [file, locale, platform]);

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
