import type { GalleryItem } from "../../components/public/GalleryPageContent";

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
  // TODO: Replace local curated assets with active, consent-approved database items once media persistence is connected.
  return publicGalleryItems;
}
