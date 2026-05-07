import type { Metadata } from "next";

const siteName = "AUTO VALET";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autovalet.example";
const defaultDescription =
  "Premium mobile car detailing at your location. Request maintenance cleans, deep cleans and finishing extras with deposit-secured booking approval.";

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
    title: "AUTO VALET | Premium Mobile Car Detailing",
    description: defaultDescription,
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
    description: "Submit a paid AUTO VALET booking request. Appointments are confirmed after manual approval.",
    purpose: "Multi-step paid booking request.",
  },
  faq: {
    path: "/faq",
    title: "FAQ | AUTO VALET",
    description: "Answers about deposits, approval, pricing, service zones, cancellation, and mobile detailing access.",
    purpose: "Explain deposit, approval, pricing, service zone, and cancellation rules.",
  },
  policies: {
    path: "/policies",
    title: "Policies | AUTO VALET",
    description: "AUTO VALET terms, privacy, deposit and cancellation policy, service area policy, and photo consent.",
    purpose: "Terms, privacy, deposit/cancellation, service area, cookie, and photo consent policies.",
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
    title: "Deposit & Cancellation Policy | AUTO VALET",
    description: "Deposit, cancellation, no-show, reschedule, and remaining balance rules for AUTO VALET.",
    purpose: "Deposit and cancellation policy.",
  },
  cookies: {
    path: "/policies/cookies",
    title: "Cookie Policy | AUTO VALET",
    description: "How AUTO VALET uses essential cookies and how analytics cookies will be handled if added later.",
    purpose: "Cookie and tracking policy.",
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
    description: "Your paid booking request has been received and is waiting for AUTO VALET review.",
    purpose: "Deposit-paid booking request success state.",
  },
  paymentFailed: {
    path: "/booking/failed",
    title: "Payment Failed | AUTO VALET",
    description: "Your deposit payment could not be completed. No booking request has been submitted.",
    purpose: "Payment failed state.",
  },
  bookingExpired: {
    path: "/booking/expired",
    title: "Booking Hold Expired | AUTO VALET",
    description: "Your payment hold has expired. Choose a new requested slot to continue.",
    purpose: "Expired payment hold state.",
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
  const canonical = new URL(routeMeta.path.replace("[reference]", ""), siteUrl).toString();

  return {
    title: routeMeta.title,
    description: routeMeta.description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title: routeMeta.title,
      description: routeMeta.description,
      siteName,
      url: canonical,
      type: "website",
    },
  };
}
