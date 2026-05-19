import type { Metadata } from "next";
import { createAbsoluteUrl, getSiteUrl, siteConfig } from "./site-config";

const noindexRoutes: PublicRouteKey[] = ["bookingStatus"];

export type PublicRouteKey =
  | "home"
  | "services"
  | "serviceArea"
  | "gallery"
  | "booking"
  | "faq"
  | "policies"
  | "privacy"
  | "terms"
  | "depositCancellation"
  | "cookies"
  | "dataRequests"
  | "contact"
  | "bookingSuccess"
  | "paymentFailed"
  | "bookingExpired"
  | "bookingStatus";

export const publicRouteMetadata: Record<
  PublicRouteKey,
  {
    path: string;
    title: string;
    description: string;
    purpose: string;
  }
> = {
  home: {
    path: "/",
    title: "Mobile Car Detailing Rochdale & Greater Manchester | AUTO VALET",
    description:
      "Premium mobile car detailing and valeting across Rochdale and Greater Manchester, with maintenance cleans, deep cleans and finishing extras.",
    purpose: "Premium introduction and booking request CTA.",
  },
  services: {
    path: "/services",
    title: "Mobile Car Valeting Services Rochdale | AUTO VALET",
    description:
      "View mobile car valeting and detailing services for Rochdale and Greater Manchester, including maintenance cleans, deep cleans and add-ons.",
    purpose: "Services, pricing, add-ons, and condition disclaimer.",
  },
  serviceArea: {
    path: "/service-area",
    title: "Mobile Car Detailing Service Areas in Greater Manchester | AUTO VALET",
    description:
      "AUTO VALET covers Rochdale, Manchester, Oldham, Bury, Bolton, Salford, Stockport, Tameside and Trafford.",
    purpose: "Service area towns, postcode guidance, and outside-zone review rules.",
  },
  gallery: {
    path: "/gallery",
    title: "Mobile Car Detailing Gallery Rochdale | AUTO VALET",
    description:
      "See AUTO VALET detailing work for vehicles across Rochdale and Greater Manchester, including exterior finishes, interiors and wheels.",
    purpose: "Before/after and placeholder work.",
  },
  booking: {
    path: "/booking",
    title: "Request Mobile Car Valeting in Greater Manchester | AUTO VALET",
    description:
      "Submit a mobile car detailing request for Rochdale or Greater Manchester. AUTO VALET reviews every appointment before confirmation.",
    purpose: "Multi-step booking request.",
  },
  faq: {
    path: "/faq",
    title: "Mobile Car Detailing FAQs | AUTO VALET Rochdale",
    description:
      "Answers about AUTO VALET mobile detailing in Rochdale and Greater Manchester, including approval, pricing, service areas and access.",
    purpose: "Explain approval, pricing, service zone, and cancellation rules.",
  },
  policies: {
    path: "/policies",
    title: "Policies | AUTO VALET",
    description: "AUTO VALET terms, privacy, cancellation policy, service area policy, and photo consent.",
    purpose: "Terms, privacy, cancellation, service area, cookie, and photo consent policies.",
  },
  privacy: {
    path: "/policies/privacy",
    title: "Privacy Policy | AUTO VALET",
    description: "How AUTO VALET handles customer data for mobile detailing booking requests.",
    purpose: "Privacy and customer data handling.",
  },
  terms: {
    path: "/policies/terms",
    title: "Terms & Conditions | AUTO VALET",
    description: "Plain-language terms for AUTO VALET mobile detailing booking requests.",
    purpose: "Booking request terms and customer responsibilities.",
  },
  depositCancellation: {
    path: "/policies/deposit-cancellation",
    title: "Cancellation Policy | AUTO VALET",
    description: "Cancellation, no-show, reschedule, and review rules for AUTO VALET.",
    purpose: "Cancellation policy.",
  },
  cookies: {
    path: "/policies/cookies",
    title: "Cookie Policy | AUTO VALET",
    description: "How AUTO VALET uses essential cookies and how analytics cookies will be handled if added later.",
    purpose: "Cookie and tracking policy.",
  },
  dataRequests: {
    path: "/policies/data-requests",
    title: "Data Requests | AUTO VALET",
    description: "Request access, correction, deletion or marketing/photo consent withdrawal for AUTO VALET data.",
    purpose: "GDPR and customer data request handling.",
  },
  contact: {
    path: "/contact",
    title: "Contact AUTO VALET | Mobile Detailing Rochdale",
    description:
      "Contact AUTO VALET for mobile car detailing and valeting across Rochdale and Greater Manchester service areas.",
    purpose: "Contact and service area guidance.",
  },
  bookingSuccess: {
    path: "/booking/success",
    title: "Booking Request Received | AUTO VALET",
    description: "AUTO VALET has received your booking request for manual review.",
    purpose: "Booking request success state before manual approval.",
  },
  paymentFailed: {
    path: "/booking/failed",
    title: "Booking Request Failed | AUTO VALET",
    description: "Your booking request could not be submitted.",
    purpose: "Booking request failed state.",
  },
  bookingExpired: {
    path: "/booking/expired",
    title: "Booking Request Expired | AUTO VALET",
    description: "Choose a new requested slot to continue.",
    purpose: "Expired booking request state.",
  },
  bookingStatus: {
    path: "/booking/status/[reference]",
    title: "Booking Status | AUTO VALET",
    description: "Check the current status of your AUTO VALET booking request.",
    purpose: "Customer booking request status by secure reference.",
  },
};

export function createPublicMetadata(route: PublicRouteKey): Metadata {
  const routeMeta = publicRouteMetadata[route];
  const canonical = routeMeta.path.includes("[") ? undefined : createAbsoluteUrl(routeMeta.path);
  const openGraphImageUrl = createAbsoluteUrl("/opengraph-image");
  const openGraphImages = openGraphImageUrl
    ? [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: siteConfig.siteName,
        },
      ]
    : undefined;
  const noindex = noindexRoutes.includes(route);
  const metadata: Metadata = {
    metadataBase: getSiteUrl(),
    title: {
      absolute: routeMeta.title,
    },
    description: routeMeta.description,
    alternates: canonical ? { canonical } : undefined,
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: routeMeta.title,
      description: routeMeta.description,
      siteName: siteConfig.siteName,
      type: "website",
      url: canonical,
      images: openGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title: routeMeta.title,
      description: routeMeta.description,
      images: openGraphImageUrl ? [openGraphImageUrl] : undefined,
    },
  };

  return metadata;
}
