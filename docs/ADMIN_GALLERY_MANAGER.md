# Admin Gallery Manager

The admin gallery manager prepares AUTO VALET for approved before/after work, single finished images and featured public gallery content.

The current implementation is a foundation. Read views use safe placeholder data and mutation/upload routes are guarded until admin auth, database persistence and media storage are connected.

## Gallery Purpose

Admin can create and review gallery items that may later appear on the public gallery or homepage story sections.

Gallery items support:

- Before/after image pairs
- Single finished images
- Draft placeholder items
- Title and description
- Service type
- Vehicle type
- Featured placement
- Active/inactive visibility
- Marketing/photo consent status
- Registration plate and personal detail checks

## Image Modes

Before/after pair:

- Requires both before and after images before publishing.
- Best for transformation-led work.

Single finished image:

- Requires one finished image before publishing.
- Best for final-result showcase items.

Placeholder only:

- Used for draft planning.
- Must stay inactive until real images and safety checks exist.

## Consent Rules

A gallery item must not be publicly visible unless all of these are true:

- `active === true`
- `hasMarketingConsent === true`
- At least one image exists
- `registrationPlateChecked === true`

Only publish images when customer marketing/photo consent is recorded. If consent is withdrawn later, the item should be deactivated and removed from public surfaces.

## Registration Plate And Personal Info Checks

Admin must confirm that registration plates, house numbers, faces, reflections and personal details are not visible before publishing.

Images should be cropped, blurred or rejected if sensitive information is visible.

## Media Storage Abstraction

Media upload is behind `MediaStorageProvider`.

Current files:

- `lib/media/types.ts`
- `lib/media/provider.ts`
- `lib/media/storage.ts`

If no storage provider is configured, upload URL creation returns:

```json
{
  "success": false,
  "error": {
    "code": "MEDIA_PROVIDER_NOT_CONFIGURED",
    "message": "Media storage provider is not configured yet.",
    "details": {}
  }
}
```

Do not fake upload success. Future providers can use Cloudinary, S3 or Supabase storage behind the same interface.

## API Contracts

`GET /api/admin/gallery`

- Requires `manage_gallery`
- Returns gallery items
- Currently guarded by placeholder auth and returns safe responses until auth is configured

`POST /api/admin/gallery`

Request:

```json
{
  "title": "Deep clean interior reset",
  "description": "Approved before/after result.",
  "serviceType": "Deep Clean",
  "vehicleType": "Large / 4x4",
  "beforeImageUrl": "https://example.com/before.jpg",
  "afterImageUrl": "https://example.com/after.jpg",
  "singleImageUrl": "",
  "altText": "Interior deep clean before and after result",
  "hasMarketingConsent": true,
  "registrationPlateChecked": true,
  "isFeatured": true,
  "active": true,
  "displayOrder": 1
}
```

Response when persistence is not connected:

```json
{
  "success": false,
  "error": {
    "code": "PERSISTENCE_NOT_CONFIGURED",
    "message": "Admin gallery items are not connected to database persistence yet.",
    "details": {}
  }
}
```

`PATCH /api/admin/gallery/[id]`

- Requires `manage_gallery`
- Validates the same fields as create
- Uses safe `501` while persistence is not configured

`POST /api/admin/gallery/upload-url`

Request:

```json
{
  "filename": "gallery-before.jpg",
  "contentType": "image/jpeg",
  "target": "gallery_before"
}
```

Targets:

- `gallery_before`
- `gallery_after`
- `gallery_single`

## Public Gallery Future Integration

`lib/gallery/public-gallery.ts` is the future public data entry point.

For now, the public gallery keeps its placeholders. `GalleryPageContent` accepts optional items, but defaults to placeholders so the public website does not change until real media persistence exists.

Future public queries must filter to active, consent-approved, image-backed items only.

## Validation Rules

- Title is required.
- Alt text is required when an image exists.
- Active items require at least one image.
- Active items require marketing/photo consent.
- Active items require registration plate and personal detail checks.
- Before/after mode requires both before and after images.
- Featured items must also be active.
- Display order must be a whole number if provided.

## Permission Rules

All gallery routes require `manage_gallery`.

When admin auth is not configured, mutation and upload routes must not proceed.

## Edge Cases

- Consent missing: keep item inactive.
- Image upload fails: do not save as active.
- Before image uploaded without after image: keep as draft until pair is complete.
- Featured but inactive: reject save.
- Customer withdraws consent: deactivate item and remove public placement.
- Plate visible after publishing: remove or deactivate immediately, then replace with safe media.
- Storage provider missing: return provider-not-configured, never fake success.
- Duplicate gallery item: future DB layer should warn or allow with clear admin context.
- Large image file: future provider should enforce size and format limits.
- Admin deletes image used on homepage: deactivate or replace featured placement before public render.

## Future Work

- Connect `gallery_items` to database persistence.
- Add real media provider adapter.
- Add image compression and file-size validation.
- Add consent source and consent timestamp tracking.
- Add audit logs for create, update, deactivate and publish actions.
- Pull featured items into homepage work story only after public-safety checks pass.
