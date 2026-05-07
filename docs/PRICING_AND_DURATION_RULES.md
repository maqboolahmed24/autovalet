# AUTO VALET Pricing and Duration Rules

The current pricing catalogue lives in `lib/pricing/catalog.ts`. It is the central source for public pages, booking package selection, add-on selection, booking review estimates, and booking summary estimates.

No database connection is used yet. When Drizzle and seed tooling are added, database seed data must match this catalogue or deliberately migrate it.

## Money Rules

- Store and calculate all money as integer GBP minor units.
- `5500` means `£55`.
- Public display uses `formatMoneyGBP`.
- Public and booking UI must say `estimated total`, not final total.
- Final price can still change depending on condition on arrival.

## Deposit Rules

The current MVP deposit rule is fixed:

```text
deposit_due_minor = min(3000, max(estimated_total_minor, 0))
```

This means:

- Standard deposit is `£30`.
- Deposit never exceeds the estimate.
- Admin-managed deposit settings can replace this later.

## Package Catalogue

### Maintenance

| Vehicle size | Price | Service duration |
|---|---:|---:|
| Small | £55 | 60 mins |
| Medium | £65 | 75 mins |
| Large / 4x4 | £75 | 90 mins |

### Deep Clean

Deep Clean durations are estimated and configurable later, but the system supports them now.

| Vehicle size | Price | Estimated service duration |
|---|---:|---:|
| Small | £160 | 150 mins |
| Medium | £165 | 180 mins |
| Large / 4x4 | £170 | 210 mins |

## Add-On Catalogue

| Add-on | Price | Extra duration |
|---|---:|---:|
| Engine bay clean | £30 | 20 mins |
| Windscreen repellent | £30 | 15 mins |
| Exhaust tips polished | £20 | 15 mins |
| Leather deep clean | £50 | 40 mins |
| Convertible roof treatment | £40 | 30 mins |
| Removal of excess pet hair | £30 | 45 mins |
| Liquid decon and clay bar | £50 | 50 mins |

## Duration Rules

Duration is calculated in minutes:

```text
service_duration = package_duration + selected_addon_durations
blocked_duration = service_duration + travel_buffer
```

The travel buffer is fixed at 45 minutes.

For multiple vehicles at the same location:

```text
service_duration = per_vehicle_service_duration * vehicle_count
blocked_duration = service_duration + one_travel_buffer
```

Do not add a 45-minute buffer between vehicles at the same address. Add one buffer after the location visit.

## Future Test Cases

When a test runner is added, implement these unit tests for `calculateBookingPrice`, `calculateBookingDuration`, and `calculateDepositDue`.

1. Maintenance small with no add-ons:
   - Estimated total: `5500`
   - Service duration: `60`
   - Travel buffer: `45`
   - Blocked duration: `105`

2. Maintenance medium with engine bay:
   - Estimated total: `9500`
   - Service duration: `95`
   - Travel buffer: `45`
   - Blocked duration: `140`

3. Deep Clean large with pet hair:
   - Estimated total: `20000`
   - Service duration: `255`
   - Travel buffer: `45`
   - Blocked duration: `300`

4. Multi-vehicle Maintenance small count 3:
   - Estimated total: `16500`
   - Service duration: `180`
   - Travel buffer: `45`
   - Blocked duration: `225`

5. Deposit never exceeds total:
   - Estimated total: `2000`
   - Deposit due: `2000`

6. Add-on durations are included:
   - Package duration plus every selected add-on duration must equal service duration.

7. One travel buffer per location visit:
   - Three vehicles at the same address still add one 45-minute buffer, not three buffers.
