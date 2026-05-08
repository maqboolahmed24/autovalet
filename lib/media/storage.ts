import { getMediaStorageProvider } from "./provider";
import type { CreateUploadUrlInput, CreateUploadUrlResult, MediaUploadTarget } from "./types";

export const galleryUploadTargets: MediaUploadTarget[] = [
  "gallery_before",
  "gallery_after",
  "gallery_single",
];

export function isMediaUploadTarget(value: unknown): value is MediaUploadTarget {
  return typeof value === "string" && galleryUploadTargets.includes(value as MediaUploadTarget);
}

export async function createGalleryUploadUrl(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult> {
  const provider = getMediaStorageProvider();

  return provider.createUploadUrl(input);
}
