import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  if (isDashboardRoute || isOnboardingRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect to onboarding/dashboard depending on state, or dashboard by default
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/register"
  ],
};
