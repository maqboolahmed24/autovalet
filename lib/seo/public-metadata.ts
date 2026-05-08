import type { Metadata } from "next";
import { createAbsoluteUrl, getSiteUrl, siteConfig } from "./site-config";

const noindexRoutes: PublicRouteKey[] = ["bookingStatus"];

export type PublicRouteKey =
  | "home"
  | "services"
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
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    purpose: "Premium introduction and booking request CTA.",
  },
  services: {
    path: "/services",
    title: "Services | AUTO VALET",
    description: "View AUTO VALET maintenance cleans, deep cleans, add-ons, and condition-based pricing notes.",
    purpose: "Services, pricing, add-ons, and condition disclaimer.",
  },
  gallery: {
    path: "/gallery",
    title: "Gallery | AUTO VALET",
    description: "Before and after AUTO VALET work, with premium placeholders until real customer images are available.",
    purpose: "Before/after and placeholder work.",
  },
  booking: {
    path: "/booking",
    title: "Request a Booking | AUTO VALET",
    description: "Submit an AUTO VALET booking request. Appointments are confirmed after manual approval.",
    purpose: "Multi-step booking request.",
  },
  faq: {
    path: "/faq",
    title: "FAQ | AUTO VALET",
    description: "Answers about approval, pricing, service zones, cancellation, and mobile detailing access.",
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
    title: "Contact | AUTO VALET",
    description: "Contact AUTO VALET and review service area guidance for mobile detailing requests.",
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
