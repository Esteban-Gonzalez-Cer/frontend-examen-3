const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

/**
 * Base URL of OUR backend. The frontend never talks to the SII API directly.
 *
 * - Development: the backend runs on another port (http://localhost:8000).
 * - Production: same-origin `/api/v1`, which vercel.json proxies to Render. Same origin is what
 *   lets browsers store the HttpOnly refresh cookie (they block it as a third-party cookie when
 *   the page calls *.onrender.com directly).
 */
const DEFAULT_BASE_URL = import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1'

export const API_BASE_URL = (rawBaseUrl?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '')
