import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/admin/login(.*)",
  "/admin/signup(.*)",
  "/acompanhamento(.*)",
  "/checkout(.*)",
  "/contato(.*)",
  "/quem-somos(.*)",
  "/trabalhe-conosco(.*)",
  "/meus-pedidos(.*)",
  "/claim(.*)",
  "/courier(.*)",
  "/:estado/:cidade/:slug(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const authObj = await auth();
    if (!authObj.userId) {
      const signInUrl = new URL("/admin/login", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return Response.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
