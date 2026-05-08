# Admin Auth And Permissions

AUTO VALET admin access must protect bookings, payments, service zones, availability, pricing, gallery content, customer records, and audit logs. This foundation defines the role model, permission map, route guard contract, and safe placeholder behavior before real database-backed sessions are connected.

## Current Implementation State

Admin authentication is intentionally not enabled yet.

The current guard returns:

```json
{
  "success": false,
  "error": {
    "code": "ADMIN_AUTH_NOT_CONFIGURED",
    "message": "Admin authentication is not configured yet.",
    "details": {}
  }
}
```

Admin mutation APIs must not proceed until a real admin session exists. The middleware also redirects `/admin/*` pages to `/admin/login` while session verification is not connected. Public routes are not protected by this middleware.

## Roles

Supported roles:

- `owner`
- `manager`
- `staff`
- `read_only`

The database descriptor for `admin_users.role` must allow exactly these values.

## Permissions

Supported permissions:

- `view_dashboard`
- `view_bookings`
- `approve_booking`
- `decline_booking`
- `reschedule_booking`
- `create_manual_booking`
- `cancel_booking`
- `mark_no_show`
- `refund_payment`
- `transfer_deposit`
- `adjust_final_price`
- `mark_balance_paid`
- `edit_availability`
- `edit_service_zones`
- `edit_services_pricing`
- `edit_deposit_settings`
- `manage_gallery`
- `view_customers`
- `edit_customers`
- `manage_admin_users`
- `view_audit_logs`

## Permission Matrix

| Permission | Owner | Manager | Staff | Read only |
| --- | --- | --- | --- | --- |
| View dashboard | Yes | Yes | Yes | Yes |
| View bookings | Yes | Yes | Yes | Yes |
| Approve booking | Yes | Yes | Yes | No |
| Decline booking | Yes | Yes | Yes | No |
| Reschedule booking | Yes | Yes | Yes | No |
| Create manual booking | Yes | Yes | Yes | No |
| Cancel booking | Yes | Yes | Yes | No |
| Mark no-show | Yes | Yes | Yes | No |
| Refund payment | Yes | Yes | No | No |
| Transfer deposit | Yes | Yes | No | No |
| Adjust final price | Yes | Yes | Yes | No |
| Mark balance paid | Yes | Yes | Yes | No |
| Edit availability | Yes | Yes | Yes | No |
| Edit service zones | Yes | Yes | No | No |
| Edit services pricing | Yes | Yes | No | No |
| Edit deposit settings | Yes | Yes | No | No |
| Manage gallery | Yes | Yes | Yes | No |
| View customers | Yes | Yes | Yes | Yes |
| Edit customers | Yes | Yes | No | No |
| Manage admin users | Yes | No | No | No |
| View audit logs | Yes | Yes | No | Yes |

## Session Approach

Future implementation should:

1. Store admins in `admin_users`.
2. Verify password hashes with a modern algorithm such as Argon2id or bcrypt.
3. Create a persisted server-side admin session.
4. Store only an opaque session token in a secure, HTTP-only, same-site cookie.
5. Expire sessions automatically.
6. Revoke sessions on logout and password changes.
7. Audit sensitive login and admin mutation events.

Do not trust client-side role or permission values.

## Password Requirements

Passwords must never be stored in plaintext.

The current `lib/auth/password.ts` functions throw safe not-configured errors until a password hashing package is installed and wired.

Production password policy should include:

- Minimum length.
- Common password rejection.
- Rate-limited login attempts.
- Password reset tokens with expiry.
- Audit logs for failed and successful login attempts.

## 2FA Plan

Owner accounts must support two-factor authentication before launch.

The current 2FA helper returns `TWO_FACTOR_NOT_CONFIGURED`. Future implementation should support a TOTP-based flow or equivalent provider-backed challenge.

## Route Guard Usage

Admin APIs should call:

```ts
const guard = await requireAdmin(request, { permission: "create_manual_booking" });

if (!guard.success) {
  return adminGuardErrorResponse(guard);
}
```

After a successful guard, route handlers may pass:

```ts
{
  adminAuthenticated: true,
  canCreateManualBooking: true,
  persistenceConfigured: false
}
```

to the existing domain functions until database writes are implemented.

## Protected Routes

Current protected admin mutation APIs:

- `POST /api/admin/bookings`
- `PATCH /api/admin/bookings/[id]/adjust-final-price`
- `POST /api/admin/bookings/[id]/mark-balance-paid`
- `POST /api/admin/bookings/[id]/cancel`
- `POST /api/admin/bookings/[id]/refund-deposit`
- `POST /api/admin/bookings/[id]/transfer-deposit`
- `POST /api/admin/bookings/[id]/mark-no-show`

Admin pages under `/admin/*` redirect to `/admin/login` while real session verification is not available. `/admin/login` is excluded to avoid redirect loops.

## Placeholder Behavior

The placeholder is fail-closed:

- No hard-coded admin credentials.
- No plaintext passwords.
- No mutation proceeds without `requireAdmin`.
- Login, logout, and session API routes return safe not-configured responses until real auth exists.
- Public website and public booking routes are not affected.

## Security Checklist

Before enabling admin auth:

1. Install a password hashing package and wire `hashPassword` / `verifyPassword`.
2. Add a database-backed session table or a secure session provider.
3. Use HTTP-only, secure, same-site cookies.
4. Add CSRF protection appropriate to the session approach.
5. Rate-limit admin login attempts.
6. Add owner 2FA.
7. Audit admin mutations and money-changing actions.
8. Keep permission checks on every mutation route.
9. Hide sensitive payment/customer details from roles that should not view them.
10. Test logout, expiry, revoked sessions, and permission denial paths.
