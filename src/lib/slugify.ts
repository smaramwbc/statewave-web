/**
 * Slugify a title for use as a stable anchor id. Stable across re-renders so
 * deep links keep working. Uniqueness is the caller's responsibility — for
 * the use-cases inventory titles are already unique.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
