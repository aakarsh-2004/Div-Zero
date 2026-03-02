import { config } from "../config/config";

const origin = (config.frontendUrl || "http://localhost:5173").replace(/\/$/, "");

export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
} as const;

/** Wrap any Response with CORS headers. */
export function withCors(res: Response): Response {
    const next = new Response(res.body, res);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => next.headers.set(k, v));
    return next;
}

/** Pre-flight response for OPTIONS requests. */
export function preflight(): Response {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}
