import { arePaymentsEnabled } from "../../lib/config/features";

export type AdminNavItem = {
  href: string;
  label: string;
  description?: string;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminMobileNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Today" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/more", label: "More" },
];

const paymentsEnabled = arePaymentsEnabled();

const baseAdminSidebarNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/bookings/new", label: "Add booking" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/service-zones", label: "Service zones" },
  { href: "/admin/services-pricing", label: "Services & pricing" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/settings", label: "Settings" },
];

export const adminSidebarNavItems: AdminNavItem[] = paymentsEnabled
  ? [
      ...baseAdminSidebarNavItems.slice(0, 8),
      { href: "/admin/deposit-settings", label: "Deposit settings" },
      ...baseAdminSidebarNavItems.slice(8),
    ]
  : baseAdminSidebarNavItems;

const businessSetupItems: AdminNavItem[] = [
  {
    href: "/admin/availability",
    label: "Availability",
    description: "Working hours, closed days and blocked time.",
  },
  {
    href: "/admin/service-zones",
    label: "Service zones",
    description: "Approved postcode and regional coverage.",
  },
  {
    href: "/admin/services-pricing",
    label: "Services & pricing",
    description: "Packages, durations, add-ons and estimates.",
  },
];

export const adminMoreGroups: AdminNavGroup[] = [
  {
    title: "Business setup",
    items: paymentsEnabled
      ? [
          ...businessSetupItems,
          {
            href: "/admin/deposit-settings",
            label: "Deposit settings",
            description: "Deposit rules before booking requests reach review.",
          },
        ]
      : businessSetupItems,
  },
  {
    title: "Content",
    items: [
      {
        href: "/admin/gallery",
        label: "Gallery",
        description: "Approved work images and featured homepage content.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        href: "/admin/settings#profile",
        label: "Admin profile",
        description: "Profile details will live in settings.",
      },
      {
        href: "/admin/settings#security",
        label: "Security",
        description: "Password, sessions and 2FA setup.",
      },
      {
        href: "/admin/settings#notifications",
        label: "Notification settings",
        description: "Email and SMS preferences once providers are connected.",
      },
    ],
  },
];

export const adminRouteLabels: Record<string, string> = {
  "/admin": "Today",
  "/admin/requests": "Requests",
  "/admin/calendar": "Calendar",
  "/admin/bookings/new": "Add booking",
  "/admin/customers": "Customers",
  "/admin/more": "More",
  "/admin/availability": "Availability",
  "/admin/service-zones": "Service zones",
  "/admin/services-pricing": "Services & pricing",
  "/admin/deposit-settings": "Deposit settings",
  "/admin/gallery": "Gallery",
  "/admin/settings": "Settings",
  "/admin/login": "Sign in",
};

export function isAdminNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}#`);
}

export function getAdminRouteLabel(pathname: string) {
  const exactLabel = adminRouteLabels[pathname];

  if (exactLabel) {
    return exactLabel;
  }

  const matchedPath = Object.keys(adminRouteLabels)
    .filter((path) => path !== "/admin" && pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];

  return matchedPath ? adminRouteLabels[matchedPath] : "Admin";
}
