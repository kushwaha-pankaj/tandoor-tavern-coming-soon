/**
 * Canonical host: tandoortavern.co.uk
 * Redirect www → apex with 301.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "www.tandoortavern.co.uk") {
    url.hostname = "tandoortavern.co.uk";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
