// Cloudflare Turnstile public site key. Behind an env seam (same pattern as
// the server's TURNSTILE_SECRET_KEY): when unset the widget is skipped and
// the form still works (fail-open). Privacy-preserving CAPTCHA — chosen over
// reCAPTCHA to keep the site free of third-party tracking (analytics stays
// cookieless via Plausible).
export const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '') as string
