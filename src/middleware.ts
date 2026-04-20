import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isExplicitlyPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const RESERVED_SEGMENTS = new Set([
  "dashboard",
  "onboarding",
  "sign-in",
  "sign-up",
  "api",
  "_next",
]);

export default clerkMiddleware(async (auth, req) => {
  const firstSegment = req.nextUrl.pathname.split("/")[1] ?? "";
  const isPublicSlugRoute =
    firstSegment.length > 0 && !RESERVED_SEGMENTS.has(firstSegment);

  if (!isExplicitlyPublic(req) && !isPublicSlugRoute) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
