import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query, transaction } from "../db/postgres";

export type AdminGalleryImageMode = "before_after" | "single" | "placeholder";

export type AdminGalleryItemInput = {
  title: string;
  description?: string;
  serviceType: string;
  vehicleType?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  singleImageUrl?: string;
  altText: string;
  hasMarketingConsent: boolean;
  registrationPlateChecked: boolean;
  isFeatured: boolean;
  active: boolean;
  displayOrder?: number;
};

export type AdminGalleryItem = AdminGalleryItemInput & {
  id: string;
  imageMode: AdminGalleryImageMode;
  previewImageUrl?: string;
  statusLabel: string;
  consentLabel: string;
  safetyLabel: string;
  canPublish: boolean;
};

export type AdminGalleryData = {
  isMockData: boolean;
  items: AdminGalleryItem[];
};

export type GalleryMutationResult =
  | {
      success: true;
      galleryItemId: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type GalleryMutationOptions = {
  adminAuthenticated?: boolean;
  canManageGallery?: boolean;
  persistenceConfigured?: boolean;
};

type GalleryItemRow = {
  id: string;
  title: string;
  description: string | null;
  service_type: string;
  vehicle_type: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  single_image_url: string | null;
  alt_text: string | null;
  has_marketing_consent: boolean;
  registration_plate_checked: boolean;
  is_featured: boolean;
  active: boolean;
  display_order: number;
};

function mapGalleryItemRow(row: GalleryItemRow): AdminGalleryItem {
  return toAdminGalleryItem({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    serviceType: row.service_type,
    vehicleType: row.vehicle_type ?? undefined,
    beforeImageUrl: row.before_image_url ?? undefined,
    afterImageUrl: row.after_image_url ?? undefined,
    singleImageUrl: row.single_image_url ?? undefined,
    altText: row.alt_text ?? "",
    hasMarketingConsent: row.has_marketing_consent,
    registrationPlateChecked: row.registration_plate_checked,
    isFeatured: row.is_featured,
    active: row.active,
    displayOrder: row.display_order,
  });
}

export async function getAdminGalleryItems(): Promise<AdminGalleryData> {
  if (!isDatabaseConfigured()) {
    return {
      isMockData: true,
      items: [],
    };
  }

  const result = await query<GalleryItemRow>(
    `
      SELECT
        id,
        title,
        description,
        service_type,
        vehicle_type,
        before_image_url,
        after_image_url,
        single_image_url,
        alt_text,
        has_marketing_consent,
        registration_plate_checked,
        is_featured,
        active,
        display_order
      FROM gallery_items
      ORDER BY display_order ASC, created_at DESC
    `,
  );

  return {
    isMockData: false,
    items: result.rows.map(mapGalleryItemRow),
  };
}

export async function createGalleryItem(
  input: AdminGalleryItemInput,
  options: GalleryMutationOptions,
): Promise<GalleryMutationResult> {
  const guard = validateGalleryMutationOptions(options);

  if (guard) return guard;

  const validation = validateGalleryItemInput(input);

  if (validation) return validation;

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "PERSISTENCE_NOT_CONFIGURED",
      message: "Admin gallery items are not connected to database persistence yet.",
    };
  }

  const galleryItemId = randomUUID();

  await transaction(async (client) => {
    await client.query(
      `
        INSERT INTO gallery_items (
          id,
          title,
          description,
          service_type,
          vehicle_type,
          before_image_url,
          after_image_url,
          single_image_url,
          alt_text,
          has_marketing_consent,
          registration_plate_checked,
          is_featured,
          active,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
      [
        galleryItemId,
        input.title.trim(),
        input.description?.trim() || null,
        input.serviceType.trim(),
        input.vehicleType?.trim() || null,
        input.beforeImageUrl?.trim() || null,
        input.afterImageUrl?.trim() || null,
        input.singleImageUrl?.trim() || null,
        input.altText.trim() || null,
        input.hasMarketingConsent,
        input.registrationPlateChecked,
        input.isFeatured,
        input.active,
        input.displayOrder ?? 0,
      ],
    );
    await client.query(
      `
        INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
        VALUES ($1, NULL, 'gallery_item', $2, 'gallery_item_created', $3::jsonb)
      `,
      [
        randomUUID(),
        galleryItemId,
        JSON.stringify({ title: input.title.trim(), active: input.active }),
      ],
    );
  });

  return {
    success: true,
    galleryItemId,
  };
}

export async function updateGalleryItem(
  id: string,
  input: AdminGalleryItemInput,
  options: GalleryMutationOptions,
): Promise<GalleryMutationResult> {
  const guard = validateGalleryMutationOptions(options);

  if (guard) return guard;

  if (!id.trim()) {
    return {
      success: false,
      code: "GALLERY_ITEM_ID_REQUIRED",
      message: "Gallery item id is required.",
    };
  }

  const validation = validateGalleryItemInput(input);

  if (validation) return validation;

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "PERSISTENCE_NOT_CONFIGURED",
      message: "Admin gallery item updates are not connected to database persistence yet.",
    };
  }

  const result = await transaction(async (client) => {
    const updateResult = await client.query<{ id: string }>(
      `
        UPDATE gallery_items
        SET title = $2,
          description = $3,
          service_type = $4,
          vehicle_type = $5,
          before_image_url = $6,
          after_image_url = $7,
          single_image_url = $8,
          alt_text = $9,
          has_marketing_consent = $10,
          registration_plate_checked = $11,
          is_featured = $12,
          active = $13,
          display_order = $14,
          updated_at = now()
        WHERE id = $1
        RETURNING id
      `,
      [
        id,
        input.title.trim(),
        input.description?.trim() || null,
        input.serviceType.trim(),
        input.vehicleType?.trim() || null,
        input.beforeImageUrl?.trim() || null,
        input.afterImageUrl?.trim() || null,
        input.singleImageUrl?.trim() || null,
        input.altText.trim() || null,
        input.hasMarketingConsent,
        input.registrationPlateChecked,
        input.isFeatured,
        input.active,
        input.displayOrder ?? 0,
      ],
    );

    if (!updateResult.rows[0]) {
      return null;
    }

    await client.query(
      `
        INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
        VALUES ($1, NULL, 'gallery_item', $2, 'gallery_item_updated', $3::jsonb)
      `,
      [
        randomUUID(),
        id,
        JSON.stringify({ title: input.title.trim(), active: input.active }),
      ],
    );

    return updateResult.rows[0];
  });

  if (!result) {
    return {
      success: false,
      code: "GALLERY_ITEM_NOT_FOUND",
      message: "Gallery item was not found.",
    };
  }

  return {
    success: true,
    galleryItemId: result.id,
  };
}

export function validateGalleryItemInput(input: AdminGalleryItemInput): GalleryMutationResult | null {
  const imageMode = getGalleryImageMode(input);
  const hasImage = hasGalleryImage(input);

  if (!input.title.trim()) {
    return {
      success: false,
      code: "GALLERY_TITLE_REQUIRED",
      message: "Gallery title is required.",
    };
  }

  if (hasImage && !input.altText.trim()) {
    return {
      success: false,
      code: "GALLERY_ALT_TEXT_REQUIRED",
      message: "Alt text is required when a gallery image exists.",
    };
  }

  if (input.active && !hasImage) {
    return {
      success: false,
      code: "GALLERY_IMAGE_REQUIRED",
      message: "An active public gallery item needs at least one image.",
    };
  }

  if (input.active && !input.hasMarketingConsent) {
    return {
      success: false,
      code: "GALLERY_CONSENT_REQUIRED",
      message: "Marketing/photo consent is required before a gallery item can be active.",
    };
  }

  if (input.active && !input.registrationPlateChecked) {
    return {
      success: false,
      code: "GALLERY_SAFETY_CHECK_REQUIRED",
      message: "Confirm registration plates and personal details are not visible before publishing.",
    };
  }

  if (imageMode === "before_after" && (!input.beforeImageUrl?.trim() || !input.afterImageUrl?.trim())) {
    return {
      success: false,
      code: "GALLERY_BEFORE_AFTER_PAIR_REQUIRED",
      message: "Before/after gallery items need both before and after images.",
    };
  }

  if (input.isFeatured && !input.active) {
    return {
      success: false,
      code: "GALLERY_FEATURED_REQUIRES_ACTIVE",
      message: "Featured gallery items must also be active.",
    };
  }

  if (input.displayOrder !== undefined && !Number.isInteger(input.displayOrder)) {
    return {
      success: false,
      code: "GALLERY_DISPLAY_ORDER_INVALID",
      message: "Display order must be a whole number.",
    };
  }

  return null;
}

export function getGalleryImageMode(input: AdminGalleryItemInput): AdminGalleryImageMode {
  const hasBeforeOrAfter = Boolean(input.beforeImageUrl?.trim() || input.afterImageUrl?.trim());
  const hasSingle = Boolean(input.singleImageUrl?.trim());

  if (hasBeforeOrAfter && !hasSingle) return "before_after";
  if (hasSingle) return "single";

  return "placeholder";
}

export function hasGalleryImage(input: AdminGalleryItemInput) {
  return Boolean(input.beforeImageUrl?.trim() || input.afterImageUrl?.trim() || input.singleImageUrl?.trim());
}

function validateGalleryMutationOptions(options: GalleryMutationOptions): GalleryMutationResult | null {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_REQUIRED",
      message: "Admin sign-in is required.",
    };
  }

  if (!options.canManageGallery) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission to manage gallery items.",
    };
  }

  return null;
}

function toAdminGalleryItem(input: AdminGalleryItemInput & { id: string }): AdminGalleryItem {
  const imageMode = getGalleryImageMode(input);
  const previewImageUrl = input.afterImageUrl || input.singleImageUrl || input.beforeImageUrl || undefined;
  const canPublish = Boolean(input.active && input.hasMarketingConsent && input.registrationPlateChecked && previewImageUrl);

  const item: AdminGalleryItem = {
    ...input,
    imageMode,
    statusLabel: input.active ? "Active" : "Draft",
    consentLabel: input.hasMarketingConsent ? "Consent recorded" : "Consent missing",
    safetyLabel: input.registrationPlateChecked ? "Plate check complete" : "Plate check needed",
    canPublish,
  };

  if (previewImageUrl) {
    item.previewImageUrl = previewImageUrl;
  }

  return item;
}

function createMockImageDataUrl(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" fill="#151515"/><rect x="28" y="28" width="584" height="364" rx="22" fill="#24211a"/><circle cx="522" cy="104" r="78" fill="#c8a96a" fill-opacity=".2"/><text x="48" y="88" fill="#c8a96a" font-family="Arial" font-size="30" font-weight="700">${label}</text><text x="48" y="332" fill="#f4f1ea" font-family="Arial" font-size="46" font-weight="800">AUTO VALET</text></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
