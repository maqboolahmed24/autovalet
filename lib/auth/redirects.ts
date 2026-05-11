const adminRedirectFallback = "/admin";
const adminRedirectBase = "https://admin.local";

export function getSafeAdminRedirectPath(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return adminRedirectFallback;
  }

  try {
    const parsedUrl = new URL(candidate, adminRedirectBase);

    if (parsedUrl.origin !== adminRedirectBase) {
      return adminRedirectFallback;
    }

    if (parsedUrl.pathname !== "/admin" && !parsedUrl.pathname.startsWith("/admin/")) {
      return adminRedirectFallback;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return adminRedirectFallback;
  }
}
