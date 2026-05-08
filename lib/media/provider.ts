import type { CreateUploadUrlInput, CreateUploadUrlResult, MediaStorageProvider } from "./types";

class NotConfiguredMediaStorageProvider implements MediaStorageProvider {
  async createUploadUrl(_input: CreateUploadUrlInput): Promise<CreateUploadUrlResult> {
    return {
      success: false,
      code: "MEDIA_PROVIDER_NOT_CONFIGURED",
      message: "Media storage provider is not configured yet.",
    };
  }
}

export function getMediaStorageProvider(): MediaStorageProvider {
  // TODO: Return a Cloudinary, S3 or Supabase storage adapter when media credentials are configured.
  return new NotConfiguredMediaStorageProvider();
}
