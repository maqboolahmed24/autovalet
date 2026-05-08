# Admin Service Zone, Pricing and Deposit Settings

This document covers the admin management foundations for service zones, service pricing, add-on durations and deposit rules.

## Current State

The admin screens are operational read-only management shells backed by the current TypeScript defaults:

- Service zones use `lib/zones/default-zones.ts`.
- Packages and add-ons use `lib/pricing/catalog.ts`.
- Deposit settings use the fixed £30 fallback from `lib/pricing/deposits.ts`.

Database persistence is not connected yet. Mutation routes validate input and permissions, then return `501 PERSISTENCE_NOT_CONFIGURED`. They must not fake successful saves.

## Service Zone Management

Service zones control where customers can request public bookings. Supported zone types are:

- Exact postcode
- Outward code
- Postcode district
- Region

Values are normalized before save:

- Postcode-like values use the postcode helpers in `lib/zones/normalize-postcode.ts`.
- Region values are uppercase trimmed text.

The admin page shows zone value, type label, active state, notes, edit action and disable action. Destructive delete is avoided; zones should be disabled with `active=false`.

Outside-zone settings currently use the default minimum of 3 vehicles at the same address. Outside-zone requests may be considered but are never guaranteed.

## Pricing Package Management

The services and pricing page shows:

- Maintenance package pricing and duration by vehicle size.
- Deep Clean package pricing and duration by vehicle size.
- Active state placeholders.
- A preview estimate using the central pricing and duration engine.

Changing durations affects public requested slot generation because the slot engine uses service duration to decide whether a service can fit inside working hours.

Changing prices affects future booking estimates. Existing booking estimates should not be silently rewritten; booking records keep price-at-booking values.

## Add-On Management

The add-on manager shows the current add-on catalogue:

- Engine bay clean: £30, 20 mins
- Windscreen repellent: £30, 15 mins
- Exhaust tips polished: £20, 15 mins
- Leather deep clean: £50, 40 mins
- Convertible roof treatment: £40, 30 mins
- Removal of excess pet hair: £30, 45 mins
- Liquid decon and clay bar: £50, 50 mins

Add-on price and duration are validated as integer minor units and whole minutes. Add-on duration is included in slot generation.

## Deposit Settings

Deposit settings support three calculation modes:

- Fixed amount
- Percentage of estimated total
- Per vehicle

The fallback setting remains:

- Fixed deposit
- £30
- Minimum £30
- Transfers allowed

The deposit calculator caps deposit due at the estimated total. Public booking remains safe if settings are unavailable by falling back to fixed £30.

## API Contracts

`GET /api/admin/service-zones`

Returns:

```json
{
  "success": true,
  "data": {
    "isMockData": true,
    "zones": [],
    "outsideZoneSettings": {
      "minimumVehicleCount": 3
    }
  }
}
```

`POST /api/admin/service-zones`

Request:

```json
{
  "zoneType": "district",
  "value": "CR0",
  "notes": "Core area",
  "active": true
}
```

`PATCH /api/admin/service-zones/[id]`

Uses the same body as create and should soft-disable with `active:false`.

`GET /api/admin/services-pricing`

Returns service package variants, add-ons and preview data from the current catalogue.

`PATCH /api/admin/services-pricing/[id]`

Request:

```json
{
  "active": true,
  "variants": [
    {
      "vehicleSize": "small",
      "priceMinor": 5500,
      "durationMinutes": 60
    }
  ]
}
```

`GET /api/admin/addons`

Returns add-on defaults.

`PATCH /api/admin/addons/[id]`

Request:

```json
{
  "priceMinor": 3000,
  "extraDurationMinutes": 20,
  "active": true
}
```

`GET /api/admin/deposit-settings`

Returns fallback deposit settings.

`PATCH /api/admin/deposit-settings`

Request:

```json
{
  "depositType": "fixed",
  "fixedAmountMinor": 3000,
  "percentage": 20,
  "perVehicleAmountMinor": 3000,
  "minimumDepositMinor": 3000,
  "transferAllowed": true,
  "policyText": "A deposit is required to submit a booking request. Your appointment is confirmed only after approval."
}
```

Mutation routes return this safe placeholder while persistence is unavailable:

```json
{
  "success": false,
  "error": {
    "code": "PERSISTENCE_NOT_CONFIGURED",
    "message": "Admin-managed service zones are not connected to database persistence yet.",
    "details": {}
  }
}
```

## Permissions

Required admin permissions:

- Service zones: `edit_service_zones`
- Services and pricing: `edit_services_pricing`
- Add-ons: `edit_services_pricing`
- Deposit settings: `edit_deposit_settings`

Admin auth is still configured as a safe placeholder. Without real session infrastructure, protected API routes return `501 ADMIN_AUTH_NOT_CONFIGURED`.

## Audit Logs

Future persistence must write audit logs for:

- Service zone create, edit and disable.
- Service package variant price or duration changes.
- Add-on price, duration or active state changes.
- Deposit settings changes.

Audit logs should record old value, new value, admin id and timestamp.

## Edge Cases

- Duplicate active zone values must be blocked.
- Invalid postcode or region values must be rejected.
- Disabling all zones should warn before launch.
- Price set to zero is allowed only when intentionally free; admin UI should make it visible.
- Service package duration set to zero should be rejected.
- Add-on duration can be zero but must be explicit.
- Deposit higher than estimated total must be capped.
- Existing bookings must keep original estimates after pricing changes.
- Public booking must continue using fallback settings when admin settings are unavailable.
- Disabled add-ons may still appear on historical bookings.
- Changing outside-zone minimum during active requests should not silently invalidate existing paid requests.
