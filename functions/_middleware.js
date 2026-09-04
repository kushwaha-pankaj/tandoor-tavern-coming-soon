/**
 * Host redirect intentionally disabled until apex domain
 * tandoortavern.co.uk is Active in Cloudflare Pages.
 * www currently serves the site directly.
 */
export async function onRequest(context) {
  return context.next();
}
