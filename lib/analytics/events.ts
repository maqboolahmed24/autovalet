export type AnalyticsEventName =
  | "homepage_viewed"
  | "primary_cta_clicked"
  | "service_card_clicked"
  | "booking_started"
  | "package_selected"
  | "vehicle_size_selected"
  | "addons_selected"
  | "postcode_submitted"
  | "zone_validated"
  | "zone_failed"
  | "slot_selected"
  | "customer_details_completed"
  | "deposit_checkout_started"
  | "deposit_paid"
  | "booking_request_created"
  | "booking_request_approved"
  | "booking_request_declined"
  | "payment_failed"
  | "admin_dashboard_viewed"
  | "admin_request_opened";

export type AnalyticsProperties = Partial<{
  serviceType: string;
  vehicleSize: string;
  addonCount: number;
  zoneResultCategory: "standard_zone" | "outside_zone_volume_allowed" | "outside_zone_blocked" | "unchecked";
  statusCategory: string;
  pagePath: string;
  bookingFlowStep: string;
}>;
