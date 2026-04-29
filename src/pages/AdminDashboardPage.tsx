import { useEffect, useState } from 'react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  readiness: {
    status: string
    checks: { name: string; status: string; detail: string; latency_ms: number }[]
  }
  migration: {
    current_revision: string | null
    expected_head: string
    is_compatible: boolean
    pending_count: number
  }
  counts: { episodes: number; memories: number; subjects: number }
  jobs: Record<string, number>
  webhooks: { total: number; delivered: number; failed: number; pending: number; dead_letter?: number }
  health_distribution: Record<string, number> | null
}

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_STATEWAVE_API_URL || 'http://localhost:8100'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'ok' || status === 'ready' || status === 'healthy'
      ? 'bg-emerald-500'
      : status === 'degraded' || status === 'watch'
        ? 'bg-amber-500'
        : 'bg-red-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
}

function StatusChip({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium'
  const style =
    status === 'ok' || status === 'ready' || status === 'healthy'
      ? 'bg-emerald-500/10 text-emerald-400'
      : status === 'degraded' || status === 'watch'
        ? 'bg-amber-500/10 text-amber-400'
        : 'bg-red-500/10 text-red-400'
  return (
    <span className={`${base} ${style}`}>
      <StatusDot status={status} />
      {status}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-theme-border bg-[var(--theme-card-bg)] p-5">
      <p className="text-xs font-medium text-theme-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-theme-primary tabular-nums">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-theme-muted mt-1">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-theme-primary uppercase tracking-wide mb-3">{children}</h2>
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
      setLastFetched(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--theme-surface-0)]">
      {/* Header */}
      <header className="border-b border-theme-border bg-[var(--theme-card-bg)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-theme-primary tracking-tight">Statewave</span>
            <span className="text-xs text-theme-muted bg-[var(--theme-surface-2)] px-2 py-0.5 rounded">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {lastFetched && (
              <span className="text-xs text-theme-muted">
                Updated {lastFetched.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              className="text-xs text-theme-muted hover:text-theme-primary transition-colors"
              title="Refresh"
            >
              ↻ Refresh
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && !data && (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-theme-muted">Loading dashboard…</p>
          </div>
        )}

        {error && !data && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-red-400 font-medium">Failed to load dashboard</p>
            <p className="text-xs text-theme-muted mt-1">{error}</p>
            <button onClick={fetchData} className="mt-3 text-xs text-accent hover:underline">
              Retry
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* System Status Row */}
            <section>
              <SectionTitle>System Status</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Readiness */}
                <div className="rounded-xl border border-theme-border bg-[var(--theme-card-bg)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-theme-muted uppercase tracking-wide">Readiness</p>
                    <StatusChip status={data.readiness.status} />
                  </div>
                  <div className="space-y-2">
                    {data.readiness.checks.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-theme-secondary">
                          <StatusDot status={c.status} />
                          {c.name}
                        </span>
                        <span className="text-theme-muted">
                          {c.latency_ms ? `${c.latency_ms}ms` : c.detail || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Migration */}
                <div className="rounded-xl border border-theme-border bg-[var(--theme-card-bg)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-theme-muted uppercase tracking-wide">Schema</p>
                    <StatusChip status={data.migration.is_compatible ? 'ok' : 'degraded'} />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Current</span>
                      <span className="text-theme-secondary font-mono">{data.migration.current_revision || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Expected</span>
                      <span className="text-theme-secondary font-mono">{data.migration.expected_head}</span>
                    </div>
                    {data.migration.pending_count > 0 && (
                      <p className="text-amber-400 mt-2">{data.migration.pending_count} pending migration(s)</p>
                    )}
                  </div>
                </div>

                {/* Jobs Summary */}
                <div className="rounded-xl border border-theme-border bg-[var(--theme-card-bg)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-theme-muted uppercase tracking-wide">Compile Jobs</p>
                    <StatusChip
                      status={
                        (data.jobs['failed'] || 0) > 0
                          ? 'degraded'
                          : (data.jobs['running'] || 0) > 10
                            ? 'degraded'
                            : 'ok'
                      }
                    />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(data.jobs).length === 0 ? (
                      <p className="text-theme-muted">No jobs recorded</p>
                    ) : (
                      Object.entries(data.jobs).map(([status, count]) => (
                        <div key={status} className="flex justify-between">
                          <span className="text-theme-muted capitalize">{status}</span>
                          <span className="text-theme-secondary tabular-nums">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Counts Row */}
            <section>
              <SectionTitle>Data</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Subjects" value={data.counts.subjects} />
                <StatCard label="Episodes" value={data.counts.episodes} />
                <StatCard label="Memories" value={data.counts.memories} />
              </div>
            </section>

            {/* Webhooks */}
            <section>
              <SectionTitle>Webhooks</SectionTitle>
              <div className="rounded-xl border border-theme-border bg-[var(--theme-card-bg)] p-5">
                {data.webhooks.total === 0 ? (
                  <p className="text-xs text-theme-muted">No webhook events recorded</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xl font-semibold text-theme-primary tabular-nums">{data.webhooks.delivered}</p>
                      <p className="text-xs text-theme-muted mt-0.5">Delivered</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-theme-primary tabular-nums">{data.webhooks.pending}</p>
                      <p className="text-xs text-theme-muted mt-0.5">Pending</p>
                    </div>
                    <div>
                      <p className={`text-xl font-semibold tabular-nums ${data.webhooks.failed > 0 ? 'text-amber-400' : 'text-theme-primary'}`}>
                        {data.webhooks.failed}
                      </p>
                      <p className="text-xs text-theme-muted mt-0.5">Failed</p>
                    </div>
                    <div>
                      <p className={`text-xl font-semibold tabular-nums ${(data.webhooks.dead_letter || 0) > 0 ? 'text-red-400' : 'text-theme-primary'}`}>
                        {data.webhooks.dead_letter || 0}
                      </p>
                      <p className="text-xs text-theme-muted mt-0.5">Dead Letter</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Health Distribution */}
            {data.health_distribution && (
              <section>
                <SectionTitle>Subject Health</SectionTitle>
                <div className="rounded-xl border border-theme-border bg-[var(--theme-card-bg)] p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {Object.entries(data.health_distribution).map(([state, count]) => (
                      <div key={state}>
                        <p className="text-xl font-semibold text-theme-primary tabular-nums">{count}</p>
                        <p className="text-xs text-theme-muted mt-0.5 capitalize flex items-center justify-center gap-1.5">
                          <StatusDot status={state} />
                          {state}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
