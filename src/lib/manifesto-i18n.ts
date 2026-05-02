/**
 * Manifesto translations.
 *
 * The /why manifesto is the ONLY translatable surface on the marketing site
 * (see .github/copilot-instructions.md). Each language lives in its own JSON
 * file under `src/locales/manifesto/<code>.json`. English is bundled with the
 * WhyPage chunk (eager import) so the hero never paints empty; every other
 * locale is loaded lazily on demand via Vite's `import.meta.glob`, so users
 * only download the language they actually pick.
 *
 * Adding a language:
 *   1. Pick its BCP-47 base tag (e.g. 'sv' for Swedish, 'fa' for Persian).
 *   2. Add an entry to LANGUAGES (native name first — that's what we display).
 *   3. Drop a fully translated file at `src/locales/manifesto/<code>.json`.
 *   4. Translations are poetic, not literal. The throughline ("only memories
 *      matter") must land emotionally — rewrite, don't translate.
 *   5. The brand name "Statewave" is never translated.
 */

import enCopy from '../locales/manifesto/en.json'

export type LangCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ja'
  | 'zh'
  | 'ko'
  | 'hi'
  | 'ar'
  | 'ru'
  | 'tr'
  | 'vi'
  | 'id'
  | 'pl'
  | 'nl'
  | 'uk'
  | 'th'
  | 'he'

export interface Language {
  code: LangCode
  /** Native name — what we show in the picker. */
  nativeName: string
  /** English name — used in tooltips, a11y, and as the picker sort key. */
  englishName: string
  /** Reading direction. Defaults to 'ltr' when omitted. */
  dir?: 'rtl'
}

/**
 * The picker shows English first (default + fallback), then everything else
 * sorted by English name. Within the picker each entry is rendered using
 * its `nativeName` so users recognise their language by sight.
 */
export const LANGUAGES: readonly Language[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese' },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', dir: 'rtl' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'th', nativeName: 'ภาษาไทย', englishName: 'Thai' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian' },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese' },
] as const

export interface ManifestoCopy {
  eyebrow: string
  headline: string
  paragraphs: [string, string, string]
  closerLead: string
  closerHighlight: string
  signoff: string
  technicalCta: string
}

/* ─── Lazy locale loader ─────────────────────────────────────────────────── */

/**
 * Vite's `import.meta.glob` builds a map of `path → () => Promise<module>`
 * at build time. Each locale becomes its own JS chunk, so adding a 30th
 * language doesn't bloat the WhyPage bundle for users who'll never see it.
 *
 * English is excluded from the lazy map because it's already eager-imported
 * above as the synchronous fallback.
 */
const localeModules = import.meta.glob<{ default: ManifestoCopy }>(
  '../locales/manifesto/*.json',
)

const LAZY_LOADERS: Partial<Record<LangCode, () => Promise<ManifestoCopy>>> = {}
for (const path in localeModules) {
  const match = path.match(/\/([a-z]{2})\.json$/)
  const code = match?.[1]
  if (code && code !== 'en' && isLangCode(code)) {
    const loader = localeModules[path]
    if (loader) {
      LAZY_LOADERS[code] = async () => (await loader()).default
    }
  }
}

/** In-memory cache so switching back to a previously-loaded locale is instant. */
const loadedCache: Partial<Record<LangCode, ManifestoCopy>> = {
  en: enCopy as ManifestoCopy,
}

/**
 * Resolve the copy for a given language. English is synchronous (eager).
 * Anything else returns a Promise — first hit fetches the chunk, subsequent
 * hits return from cache.
 */
export async function loadManifesto(code: LangCode): Promise<ManifestoCopy> {
  const cached = loadedCache[code]
  if (cached) return cached

  const loader = LAZY_LOADERS[code]
  if (!loader) {
    // Unknown language — fall back to English rather than throwing. Picker
    // can only emit codes from LANGUAGES, but defending the boundary is cheap.
    return enCopy as ManifestoCopy
  }

  const copy = await loader()
  loadedCache[code] = copy
  return copy
}

/** English copy, available synchronously for the initial render. */
export const ENGLISH_COPY: ManifestoCopy = enCopy as ManifestoCopy

/* ─── Detection & persistence ────────────────────────────────────────────── */

const STORAGE_KEY = 'statewave:manifesto-lang'

function isLangCode(value: string | null | undefined): value is LangCode {
  return !!value && LANGUAGES.some((l) => l.code === value)
}

/**
 * Resolve the initial language: stored preference wins, else best match
 * against `navigator.language(s)`, else English.
 *
 * SSR-safe: returns 'en' when window is unavailable. The runtime hook
 * re-reads on mount, so a stored preference still applies after hydration.
 */
export function detectInitialLang(): LangCode {
  if (typeof window === 'undefined') return 'en'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLangCode(stored)) return stored
  } catch {
    // localStorage may be unavailable (Safari private mode, embedded contexts).
  }

  const browserTags =
    typeof navigator !== 'undefined'
      ? (navigator.languages ?? [navigator.language])
      : []

  for (const tag of browserTags) {
    const base = (tag ?? '').toLowerCase().split(/[-_]/)[0]
    if (isLangCode(base)) return base
  }

  return 'en'
}

export function persistLang(code: LangCode): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Non-blocking — selection still survives the session via React state.
  }
}

export function languageFor(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!
}
