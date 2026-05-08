# Admin App Shell

The AUTO VALET admin shell is the persistent operations frame for bookings, requests, calendar work, customer records, and setup tools.

## Purpose

The shell keeps admin work simple and mobile-first:

- One clear header.
- One main content region.
- Mobile bottom navigation.
- Desktop sidebar navigation.
- Fast access to Add booking.
- Clear auth setup state while real sessions are not connected.

It does not implement the dashboard, request inbox, calendar, availability tools, or settings workflows. Those screens have placeholder pages so shell links are not dead.

## Mobile Bottom Nav

Mobile navigation has five primary tabs:

1. Today -> `/admin`
2. Requests -> `/admin/requests`
3. Calendar -> `/admin/calendar`
4. Customers -> `/admin/customers`
5. More -> `/admin/more`

The bottom nav is fixed, has a safe-area-aware page padding allowance, and each link has at least a 44px tap target.

## Desktop Sidebar

At desktop width the shell switches to a sticky sidebar:

1. Dashboard -> `/admin`
2. Requests -> `/admin/requests`
3. Calendar -> `/admin/calendar`
4. Add booking -> `/admin/bookings/new`
5. Customers -> `/admin/customers`
6. Availability -> `/admin/availability`
7. Service zones -> `/admin/service-zones`
8. Services & pricing -> `/admin/services-pricing`
9. Deposit settings -> `/admin/deposit-settings`
10. Gallery -> `/admin/gallery`
11. Settings -> `/admin/settings`

## More Menu Structure

The More page groups secondary admin tools:

Business setup:

- Availability
- Service zones
- Services & pricing
- Deposit settings

Content:

- Gallery
- Reviews placeholder

Account:

- Admin profile
- Security
- Notification settings

Account links point to the settings page until dedicated account subpages exist.

## Active Nav Rules

Active navigation is handled in client components with `usePathname`.

Rules:

- `/admin` is active only on the exact dashboard route.
- Other links are active when the pathname equals the href or starts with that href plus `/`.
- Active items use `aria-current="page"` and `.is-active`.

## Accessibility

The shell includes:

- Skip link to `#admin-main`.
- `main id="admin-main"` with `tabIndex={-1}`.
- Mobile and desktop nav elements with clear `aria-label` values.
- `aria-current="page"` for active links.
- Minimum 44px tap targets.
- Enough bottom padding so the fixed mobile nav does not cover content.

## Auth State Placeholder

Admin authentication is not configured yet. The header shows `Auth setup needed`, and admin mutation APIs fail closed through `requireAdmin`.

Current middleware redirects `/admin/*` to `/admin/login` while real session verification is unavailable. `/admin/login` is excluded to avoid redirect loops. Public routes are unaffected.

## Future Improvements

- Replace auth placeholder state with real admin session data.
- Show admin name and role in the header/sidebar.
- Add logout action.
- Add dashboard counts once booking persistence exists.
- Add role-filtered navigation when permissions are enforced in UI.
- Add request, calendar, availability and settings tools in their dedicated prompts.
