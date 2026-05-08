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

export async function getAdminGalleryItems(): Promise<AdminGalleryData> {
  return {
    isMockData: false,
    items: [],
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

  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message: "Admin gallery items are not connected to database persistence yet.",
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

  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message: "Admin gallery item updates are not connected to database persistence yet.",
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
