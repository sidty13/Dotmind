import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/docs(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',
  '/DOTMIND.png',
  '/dotmind.png',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|PNG|JPG|JPEG|WEBP|SVG|ICO)).*)',
    '/(api|trpc)(.*)',
  ],
};
