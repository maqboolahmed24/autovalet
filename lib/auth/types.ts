export type AdminRole =
  | "owner"
  | "manager"
  | "staff"
  | "read_only";

export type AdminPermission =
  | "view_dashboard"
  | "view_bookings"
  | "approve_booking"
  | "decline_booking"
  | "reschedule_booking"
  | "create_manual_booking"
  | "cancel_booking"
  | "mark_no_show"
  | "refund_payment"
  | "transfer_deposit"
  | "adjust_final_price"
  | "mark_balance_paid"
  | "edit_availability"
  | "edit_service_zones"
  | "edit_services_pricing"
  | "edit_deposit_settings"
  | "manage_gallery"
  | "view_customers"
  | "edit_customers"
  | "manage_admin_users"
  | "view_audit_logs";

export type AdminSession = {
  adminId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: AdminPermission[];
};

export type RequireAdminOptions = {
  permission?: AdminPermission;
};

export type AdminGuardResult =
  | {
      success: true;
      session: AdminSession;
    }
  | {
      success: false;
      status: number;
      code: string;
      message: string;
    };

export type AdminAuthStatus =
  | {
      configured: true;
    }
  | {
      configured: false;
      code: "ADMIN_AUTH_NOT_CONFIGURED";
      message: string;
    };
