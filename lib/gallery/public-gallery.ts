import type { GalleryItem } from "../../components/public/GalleryPageContent";
import { isDatabaseConfigured, query } from "../db/postgres";

const clientUpdateGalleryBase = "/media/auto-valet/gallery/client-update-june-2026";

const publicGalleryItems: GalleryItem[] = [
  {
    id: "brabus-g-class-detail-stack",
    title: "Brabus G-Class Detail Stack",
    description:
      "A same-vehicle set covering the wash stage, carbon arch, gloss details, rear quarter and red cabin finish.",
    serviceType: "Deep Clean",
    vehicleType: "Brabus G-Class",
    imageStack: [
      {
        imageUrl: "/media/auto-valet/gallery/brabus-g-class/front-wash.webp",
        altText: "White Brabus G-Class during exterior wash stage outside the detailing bay",
        subject: "Wash stage",
      },
      {
        imageUrl: "/media/auto-valet/gallery/brabus-g-class/carbon-arch.webp",
        altText: "Carbon arch, wheel and side trim detail on a white Brabus G-Class",
        subject: "Carbon arch",
      },
      {
        imageUrl: "/media/auto-valet/gallery/brabus-g-class/side-gloss.webp",
        altText: "Red leather Brabus G-Class cabin after interior detailing",
        subject: "Red cabin",
      },
      {
        imageUrl: "/media/auto-valet/gallery/brabus-g-class/rear-quarter.webp",
        altText: "Rear quarter, wheel and Brabus trim on a white G-Class after detailing",
        subject: "Rear quarter",
      },
      {
        imageUrl: "/media/auto-valet/gallery/brabus-g-class/red-cabin.webp",
        altText: "Glossy side panel and window reflections on a white Brabus G-Class",
        subject: "Side gloss",
      },
      {
        imageUrl: "/media/auto-valet/gallery/brabus-g-class/side-profile.webp",
        altText: "White Brabus G-Class side profile showing clean bodywork and carbon trim",
        subject: "Side profile",
      },
    ],
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "audi-rs3-detail-stack",
    title: "Audi RS 3 Detail Stack",
    description:
      "A same-car set showing paint clarity, wheel finish, rear-quarter reflections and the cleaned cabin presentation.",
    serviceType: "Exterior + Interior",
    vehicleType: "Audi RS 3",
    imageStack: [
      {
        imageUrl: "/media/auto-valet/gallery/audi-rs3/rear-side-gloss.webp",
        altText: "White Audi RS 3 rear side panel and wheel after detailing",
        subject: "Rear side gloss",
      },
      {
        imageUrl: "/media/auto-valet/gallery/audi-rs3/front-wheel-finish.webp",
        altText: "White Audi RS 3 front wing, mirror and wheel finish",
        subject: "Front wheel finish",
      },
      {
        imageUrl: "/media/auto-valet/gallery/audi-rs3/rear-wheel-detail.webp",
        altText: "White Audi RS 3 rear wheel, side glass and panel finish",
        subject: "Rear wheel detail",
      },
      {
        imageUrl: "/media/auto-valet/gallery/audi-rs3/cabin-wide.webp",
        altText: "Audi RS 3 cabin, seats, dashboard and console after interior care",
        subject: "Cabin reset",
      },
      {
        imageUrl: "/media/auto-valet/gallery/audi-rs3/cockpit-detail.webp",
        altText: "Audi RS 3 cockpit detail with clean dashboard and steering wheel",
        subject: "Cockpit detail",
      },
      {
        imageUrl: "/media/auto-valet/gallery/audi-rs3/dash-detail.webp",
        altText: "Audi RS 3 dashboard and steering wheel detail after interior care",
        subject: "Dash detail",
      },
    ],
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "green-audi-avant-finish-stack",
    title: "Green Audi Avant Finish Stack",
    description:
      "A complete exterior and cabin view showing wheel detail, paint reflections, glass and the finished rear stance.",
    serviceType: "Exterior + Interior",
    vehicleType: "Audi Avant",
    imageStack: [
      {
        imageUrl: `${clientUpdateGalleryBase}/img-3952.webp`,
        altText: "Green Audi Avant rear quarter, glass and wheel finish after detailing",
        subject: "Rear quarter",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-3948.webp`,
        altText: "Green Audi Avant cabin and front seats after interior detailing",
        subject: "Cabin finish",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-3946.webp`,
        altText: "Green Audi Avant front wheel and brake detail after exterior care",
        subject: "Front wheel",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-3945.webp`,
        altText: "Green Audi Avant side panel and rear wheel reflections after detailing",
        subject: "Side gloss",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-3943.webp`,
        altText: "Green Audi Avant rear stance and road reflections after detailing",
        subject: "Rear stance",
      },
    ],
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "white-audi-finish-stack",
    title: "White Audi Finish Stack",
    description:
      "A sharp exterior presentation paired with a red cabin detail for a clean, finished handover view.",
    serviceType: "Exterior + Interior",
    vehicleType: "Audi",
    imageStack: [
      {
        imageUrl: `${clientUpdateGalleryBase}/img-6172.webp`,
        altText: "White Audi exterior after detailing beside the AUTO VALET van",
        subject: "Exterior finish",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-6156.webp`,
        altText: "White Audi red leather cabin after interior detailing",
        subject: "Red cabin",
      },
    ],
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "lamborghini-urus-finish-stack",
    title: "Lamborghini Urus Finish Stack",
    description:
      "A black Urus set showing exterior gloss, wheel finish, rear stance and a clean cabin presentation.",
    serviceType: "Exterior + Interior",
    vehicleType: "Lamborghini Urus",
    imageStack: [
      {
        imageUrl: `${clientUpdateGalleryBase}/img-2639.webp`,
        altText: "Black Lamborghini Urus front three-quarter view after detailing",
        subject: "Front stance",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-2701-urus-front.webp`,
        altText: "Black Lamborghini Urus front finish and sky reflections after detailing",
        subject: "Front gloss",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-2699-urus-rear.webp`,
        altText: "Black Lamborghini Urus rear view after detailing on a driveway",
        subject: "Rear gloss",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-4663.webp`,
        altText: "Lamborghini Urus cabin and centre console after interior detailing",
        subject: "Cabin reset",
      },
    ],
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "black-g-class-finish-stack",
    title: "Black G-Class Finish Stack",
    description:
      "A black G-Class exterior and red cabin pair showing the final stance and interior reset together.",
    serviceType: "Exterior + Interior",
    vehicleType: "Mercedes-Benz G-Class",
    imageStack: [
      {
        imageUrl: `${clientUpdateGalleryBase}/img-1220.webp`,
        altText: "Black Mercedes-Benz G-Class rear exterior after detailing",
        subject: "Rear finish",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-1204.webp`,
        altText: "Mercedes-Benz G-Class red and black cabin after interior detailing",
        subject: "Cabin reset",
      },
    ],
    isPlaceholder: false,
    isFeatured: true,
    hasMarketingConsent: true,
  },
  {
    id: "grey-porsche-finish-stack",
    title: "Grey Porsche Finish Stack",
    description:
      "A two-angle Porsche finish showing the front paintwork, wheel detail and clean final presentation.",
    serviceType: "Exterior",
    vehicleType: "Porsche",
    imageStack: [
      {
        imageUrl: `${clientUpdateGalleryBase}/img-0851.webp`,
        altText: "Grey Porsche front three-quarter exterior after detailing",
        subject: "Front angle",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/img-0850.webp`,
        altText: "Grey Porsche front bumper and wheel finish after detailing",
        subject: "Front detail",
      },
    ],
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "bmw-m340i-finish-stack",
    title: "BMW M340i Finish Stack",
    description:
      "A grey BMW M340i set showing rear gloss, side reflections and the finished driveway presentation.",
    serviceType: "Exterior",
    vehicleType: "BMW M340i",
    imageStack: [
      {
        imageUrl: `${clientUpdateGalleryBase}/ed176041-bmw-rear.webp`,
        altText: "Grey BMW M340i rear quarter and side reflection after detailing",
        subject: "Rear gloss",
      },
      {
        imageUrl: `${clientUpdateGalleryBase}/76a8c84f-bmw-collage.webp`,
        altText: "Grey BMW M340i exterior angles after detailing",
        subject: "Finished angles",
      },
    ],
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "blue-paint-check",
    title: "Blue Paint Check",
    description: "A close inspection moment showing gloss and clarity during exterior finishing.",
    serviceType: "Exterior",
    vehicleType: "BMW",
    imageUrl: `${clientUpdateGalleryBase}/img-6027.webp`,
    altText: "Blue vehicle paint and wheel detail being checked through a phone camera",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "luxury-cabin-detail",
    title: "Luxury Cabin Detail",
    description: "A clean cabin detail showing leather, console trim and glass after interior care.",
    serviceType: "Interior",
    vehicleType: "Luxury vehicle",
    imageUrl: `${clientUpdateGalleryBase}/img-2653.webp`,
    altText: "Luxury vehicle cabin with clean leather and centre console after detailing",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
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
  {
    id: "brabus-front-detail",
    title: "Brabus Front Detail",
    description: "A front exterior angle showing the washed bodywork, carbon trim and wheel finish.",
    serviceType: "Deep Clean",
    vehicleType: "Brabus G-Class",
    imageUrl: "/media/auto-valet/gallery/single/brabus-front-detail.webp",
    altText: "White Brabus G-Class front exterior and carbon trim during detailing",
    isPlaceholder: false,
    hasMarketingConsent: true,
  },
  {
    id: "audi-side-reflection",
    title: "Audi Side Reflection",
    description: "A close side detail showing clean paint reflection, mirror trim and panel finish.",
    serviceType: "Exterior",
    vehicleType: "Audi RS 3",
    imageUrl: "/media/auto-valet/gallery/single/audi-front-quarter.webp",
    altText: "White Audi RS 3 side panel and mirror reflection after detailing",
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
