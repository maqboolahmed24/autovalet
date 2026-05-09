import type { GalleryItem } from "../../components/public/GalleryPageContent";
import { isDatabaseConfigured, query } from "../db/postgres";

const publicGalleryItems: GalleryItem[] = [
  {
    id: "audi-exterior-finish",
    title: "Exterior Finish",
    description: "A crisp white exterior crop focused on paintwork, glass and wheel detail.",
    serviceType: "Exterior",
    vehicleType: "Audi",
    imageUrl: "/media/auto-valet/exterior-finish.webp",
    altText: "White Audi rear quarter exterior detail after valeting",
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "audi-interior-reset",
    title: "Interior Reset",
    description: "A clean cabin view showing seats, dash and console after interior care.",
    serviceType: "Interior",
    vehicleType: "Audi",
    imageUrl: "/media/auto-valet/interior-reset.webp",
    altText: "Audi interior cabin after valeting",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "premium-red-cabin",
    title: "Premium Cabin",
    description: "Leather seating and high-touch materials presented with a careful finish.",
    serviceType: "Interior",
    vehicleType: "G-Class",
    imageUrl: "/media/auto-valet/red-interior.webp",
    altText: "Red leather premium vehicle interior after detailing",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "final-finish",
    title: "Final Finish",
    description: "A close exterior angle showing the final stance and reflective finish.",
    serviceType: "Finish",
    vehicleType: "Audi",
    imageUrl: "/media/auto-valet/final-finish.webp",
    altText: "White Audi final exterior finish detail",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
];

export async function getPublicGalleryItems(): Promise<GalleryItem[]> {
  if (isDatabaseConfigured()) {
    const result = await query<{
      id: string;
      title: string;
      description: string | null;
      service_type: string;
      vehicle_type: string | null;
      before_image_url: string | null;
      after_image_url: string | null;
      single_image_url: string | null;
      alt_text: string | null;
      is_featured: boolean;
      has_marketing_consent: boolean;
    }>(
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
          is_featured,
          has_marketing_consent
        FROM gallery_items
        WHERE active = true
          AND has_marketing_consent = true
          AND registration_plate_checked = true
          AND (
            single_image_url IS NOT NULL
            OR (before_image_url IS NOT NULL AND after_image_url IS NOT NULL)
          )
        ORDER BY is_featured DESC, display_order ASC, created_at DESC
        LIMIT 24
      `,
    );

    if (result.rows.length > 0) {
      return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        serviceType: row.service_type,
        vehicleType: row.vehicle_type ?? undefined,
        imageUrl: row.single_image_url ?? undefined,
        beforeImageUrl: row.before_image_url ?? undefined,
        afterImageUrl: row.after_image_url ?? undefined,
        altText: row.alt_text ?? row.title,
        isPlaceholder: false,
        isFeatured: row.is_featured,
        hasMarketingConsent: row.has_marketing_consent,
      }));
    }
  }

  return publicGalleryItems;
}
