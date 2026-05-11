import { NextResponse, type NextRequest } from "next/server";
import { isAdminSessionSecretStrong, verifySignedAdminSessionValue } from "./lib/auth/session-cookie";

const adminSessionCookieName = "av_admin_session";

function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isAdminLoginPath(pathname)) {
    const sessionCookie = request.cookies.get(adminSessionCookieName)?.value ?? "";
    const sessionSecret = getAdminSessionSecret();

    if (sessionCookie && isAdminSessionSecretStrong(sessionSecret)) {
      const session = await verifySignedAdminSessionValue(sessionCookie, sessionSecret);

      if (session) {
        return NextResponse.next();
      }
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
