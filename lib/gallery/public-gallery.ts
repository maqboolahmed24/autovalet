import type { GalleryItem } from "../../components/public/GalleryPageContent";
import { isDatabaseConfigured, query } from "../db/postgres";

const publicGalleryItems: GalleryItem[] = [
  {
    id: "ferrari-exterior-finish",
    title: "Exterior Finish",
    description: "A glossy red exterior finish focused on paintwork, glass and wheel detail.",
    serviceType: "Exterior",
    vehicleType: "Ferrari",
    imageUrl: "/media/auto-valet/exterior-finish.webp",
    altText: "Red Ferrari exterior detail after valeting",
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "audi-interior-reset",
    title: "Interior Reset",
    description: "A clean cabin view showing seats, dash and console after interior care.",
    serviceType: "Interior",
    vehicleType: "BMW",
    imageUrl: "/media/auto-valet/interior-reset.webp",
    altText: "BMW M5 interior cabin after valeting",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "alloys-wheels-finish",
    title: "Alloys/Wheels Finish",
    description: "Clean alloy faces, tyre walls and exterior trim presented with a sharp finish.",
    serviceType: "Wheels",
    vehicleType: "Audi",
    imageUrl: "/media/auto-valet/red-interior.webp",
    altText: "Alloy wheel and exterior trim finish after valeting",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "final-finish",
    title: "Final Finish",
    description: "A clean rear angle showing the final stance, gloss and reflective finish.",
    serviceType: "Finish",
    vehicleType: "BMW",
    imageUrl: "/media/auto-valet/final-finish.webp",
    altText: "Grey BMW final exterior finish after valeting",
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
