/** Error codes the API may answer with; the page picks its Hebrew text by the code (S4). */
export type ApiErrorCode = 'unknown_cabin';

/**
 * Sends JSON. No Access-Control-Allow-Origin header is ever set, so only our own pages can read it (S12).
 * cacheSeconds of 0 means the answer is not stored anywhere.
 */
export function jsonResponse(body: unknown, status = 200, cacheSeconds = 0): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

/** Sends an error as a code only: never a message, stack or path from the server (S4). */
export function errorResponse(code: ApiErrorCode, status: number): Response {
  return jsonResponse({ error: code }, status);
}
