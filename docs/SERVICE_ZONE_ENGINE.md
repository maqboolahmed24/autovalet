# AUTO VALET Service Zone Engine

## Purpose

AUTO VALET validates customer postcodes against approved service zones before payment. A customer can submit a paid booking request only when the location is in the standard zone or when an outside-zone request meets the minimum vehicle count rule.

This is still a booking request model. Passing service-zone validation does not confirm the appointment.

## Current Implementation State

The engine is dependency-free and uses an in-memory placeholder zone list in `lib/zones/default-zones.ts`.

```text
TODO: Replace placeholder default zones with admin-managed rows from service_zones before launch.
```

No map API, radius calculation, distance calculation, or geocoding is used.

## Zone Types

Supported zone types:

- `exact_postcode`: full UK postcode, such as `CR0 1AA`
- `outward_code`: first postcode part, such as `CR0`
- `district`: pragmatic postcode district match, such as `CR0` or `SW1A`
- `region`: admin-entered region name, such as `Croydon`

The database schema currently documents `postcode_district`; this first TypeScript engine uses the prompt-requested public type name `district`. The future admin database mapper should translate safely between these names if needed.

## Postcode Normalization

Helpers live in `lib/zones/normalize-postcode.ts`.

Examples:

- `normalizePostcode("sw1a 1aa")` -> `SW1A 1AA`
- `compactPostcode("SW1A 1AA")` -> `SW1A1AA`
- `getOutwardCode("SW1A 1AA")` -> `SW1A`
- `getPostcodeArea("SW1A 1AA")` -> `SW`
- `getPostcodeDistrict("SW1A 1AA")` -> `SW1A`

The district extractor is pragmatic. It handles common UK outward-code forms but is not a full postal-address validation library.

## Matching Order

`validateServiceZone` checks active zones in this order:

1. Exact postcode
2. Outward code
3. District
4. Region name, if provided
5. Outside-zone volume exception
6. Outside service area block

## Outside-Zone 3+ Rule

Default minimum:

```text
DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT = 3
```

If no standard zone matches:

- `vehicleCount >= 3`: allowed as `outside_zone_volume_exception`
- `vehicleCount < 3`: blocked as `outside_service_area`

Customer-facing wording must say outside-zone requests may be considered. Do not guarantee approval.

## API Contract

Endpoint:

```text
POST /api/validate-zone
```

Request:

```json
{
  "postcode": "CR0 1AA",
  "regionName": "Croydon",
  "vehicleCount": 1
}
```

Inside-zone response:

```json
{
  "success": true,
  "data": {
    "allowed": true,
    "zoneStatus": "standard_zone",
    "matchType": "district",
    "matchedValue": "CR0",
    "message": "This location is inside the standard service area."
  },
  "message": "This location is inside the standard service area."
}
```

Outside-zone volume response:

```json
{
  "success": true,
  "data": {
    "allowed": true,
    "zoneStatus": "outside_zone_volume_exception",
    "matchType": "volume_exception",
    "requiredVehicleCount": 3,
    "message": "This location is outside the usual service area, but 3+ vehicles may be considered for review."
  }
}
```

Blocked validation result:

```json
{
  "success": true,
  "data": {
    "allowed": false,
    "zoneStatus": "outside_service_area",
    "requiredVehicleCount": 3,
    "message": "This location is outside the usual service area. AUTO VALET can consider 3+ vehicles at the same address."
  }
}
```

Empty postcode error:

```json
{
  "success": false,
  "error": {
    "code": "POSTCODE_REQUIRED",
    "message": "Please enter a postcode before checking the service area.",
    "details": {}
  }
}
```

Blocked outside-zone validation uses HTTP 200 because it is a business result, not a server failure. Empty input uses HTTP 400.

## UI Behavior

The booking Location step:

- Does not call the API on every keystroke.
- Provides a `Check service area` button below the postcode field.
- Sends postcode and vehicle count to `/api/validate-zone`.
- Shows loading, success, warning, or blocked copy.
- Updates `draft.zoneCheckStatus`.

Mapping:

- `standard_zone` -> `standard_zone`
- `outside_zone_volume_exception` -> `outside_zone_volume_allowed`
- `outside_service_area` -> `outside_zone_blocked`

The Multi-Vehicle step:

- Keeps explaining that outside-zone requests may be considered for 3+ vehicles.
- Converts a blocked outside-zone state to volume-allowed when the customer selects 3+ vehicles.
- Converts it back to blocked if the count drops below 3.

The stepper blocks moving past the location step until the service area has been checked. It then blocks moving past the vehicle-count step only when:

```text
zoneCheckStatus === "outside_zone_blocked" && vehicleCount < 3
```

Unchecked service area does not reach review because the booking-request API rejects unchecked submissions.

## Future Admin-Managed Zones

Before launch:

- Replace `defaultServiceZones` with rows from `service_zones`.
- Keep the same matching order.
- Add admin CRUD for exact postcodes, outward codes, districts, and regions.
- Audit admin zone changes.
- Rate-limit the public validation endpoint.

## Test Cases

Documented cases for future unit/integration tests:

1. Exact postcode match passes.
2. Outward code match passes.
3. District match passes.
4. Region match passes.
5. Outside zone with 1 vehicle is blocked.
6. Outside zone with 3 vehicles is allowed as a volume exception.
7. Lowercase postcode normalizes correctly.
8. Empty postcode returns `POSTCODE_REQUIRED`.
