export type MediaUploadTarget = "gallery_before" | "gallery_after" | "gallery_single";

export type CreateUploadUrlInput = {
  filename: string;
  contentType: string;
  target: MediaUploadTarget;
};

export type CreateUploadUrlResult =
  | {
      success: true;
      uploadUrl: string;
      publicUrl: string;
      fields?: Record<string, string>;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export interface MediaStorageProvider {
  createUploadUrl(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult>;
}
