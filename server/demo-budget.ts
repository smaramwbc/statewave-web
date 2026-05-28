/**
 * Global daily LLM-call circuit breaker for the public demo chat.
 *
 * The hard ceiling on demo cost. The per-IP rate limiter (see rate-limit.ts)
 * is only a speed bump — a client can rotate IPs (or clear the visitor cookie)
 * to evade it. This counter bounds the worst case regardless: total demo LLM
 * calls per UTC day on a given process cannot exceed the budget. When it is
 * spent, the chat handler stops calling the upstream LLM and returns a friendly
 * "demo is resting" message until the next UTC day.
 *
 * Deployment honesty (mirrors rate-limit.ts):
 *   - Canonical single long-running container: accurate; the counter lives for
 *     the process lifetime and resets on restart. A restart just grants a fresh
 *     budget — acceptable for a cost guard.
 *   - Multi-replica (Fly multi-machine): the budget is per-replica, so the
 *     effective ceiling is N × budget. Lower WIDGET_CHAT_DAILY_BUDGET if running
 *     many replicas.
 *   - Optional Vercel serverless adapter: in-memory state does NOT persist
 *     across invocations, so this guard is weak there. The canonical deploy is
 *     the container, not Vercel — documented, not silently broken.
 *
 * Not a security boundary — a spend ceiling. Web-shape only (no Node types) so
 * the optional Vercel adapter can import it too.
 */

const DEFAULT_DAILY_BUDGET = 4000

function dailyBudget(): number {
  const n = Number(process.env.WIDGET_CHAT_DAILY_BUDGET)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_BUDGET
}

/** UTC calendar day, e.g. "2026-05-28". Rolls the counter at UTC midnight. */
function utcDayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

function secondsUntilUtcMidnight(now: number): number {
  const d = new Date(now)
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)
  return Math.max(1, Math.ceil((next - now) / 1000))
}

let day = utcDayKey(Date.now())
let spent = 0

export interface DemoBudgetResult {
  allowed: boolean
  /** Calls remaining in today's budget (0 when exhausted). */
  remaining: number
  /** Seconds until the budget resets (UTC midnight) — use for `Retry-After`. */
  retryAfterSec: number
}

/**
 * Consume one unit of today's budget. Call once per request that will make an
 * upstream LLM call. Returns `allowed: false` WITHOUT consuming once the budget
 * for the current UTC day is exhausted, so repeated/retried blocked calls don't
 * push the counter further.
 */
export function consumeDemoBudget(now: number = Date.now()): DemoBudgetResult {
  const today = utcDayKey(now)
  if (today !== day) {
    day = today
    spent = 0
  }
  const budget = dailyBudget()
  if (spent >= budget) {
    return { allowed: false, remaining: 0, retryAfterSec: secondsUntilUtcMidnight(now) }
  }
  spent += 1
  return { allowed: true, remaining: budget - spent, retryAfterSec: 0 }
}

/** Test-only: reset the in-process counter so suites start from a clean slate. */
export function __resetDemoBudget(): void {
  day = utcDayKey(Date.now())
  spent = 0
}
