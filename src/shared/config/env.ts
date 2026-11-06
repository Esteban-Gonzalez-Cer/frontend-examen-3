const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

/** Base URL of OUR backend. The frontend never talks to the SII API directly. */
export const API_BASE_URL = (rawBaseUrl ?? 'http://localhost:8000/api/v1').replace(/\/+$/, '')
