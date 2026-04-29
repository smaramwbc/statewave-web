#!/usr/bin/env node
/**
 * Seed the Statewave backend with demo subjects for the hero visualization.
 *
 * Usage:
 *   STATEWAVE_URL=https://statewave-api.fly.dev node scripts/seed-hero-data.mjs
 *
 * This creates 5 subjects, each with realistic episodes, then compiles memories.
 * The statewave-web hero visualization will fetch this data in real-time.
 */

const BASE_URL = process.env.STATEWAVE_URL || 'https://statewave-api.fly.dev'
const API_KEY = process.env.STATEWAVE_API_KEY || ''

const headers = {
  'Content-Type': 'application/json',
  ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
}

async function post(path, body) {
  const resp = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`POST ${path} failed: ${resp.status} ${text}`)
  }
  return resp.json()
}

// ─── Demo Data ───

const subjects = {
  'demo-support-agent': [
    { source: 'zendesk', type: 'ticket_opened', payload: { content: 'Customer reported login failure on mobile app', priority: 'high', channel: 'email' } },
    { source: 'zendesk', type: 'customer_reply', payload: { content: 'Attached screenshot showing error code AUTH-503', attachments: 1 } },
    { source: 'zendesk', type: 'agent_action', payload: { content: 'Escalated to L2 — authentication service issue confirmed', action: 'escalate' } },
    { source: 'zendesk', type: 'resolution', payload: { content: 'Password reset link sent, customer confirmed access restored', resolution_time_hours: 2.5 } },
    { source: 'zendesk', type: 'survey', payload: { content: 'CSAT survey completed: 5/5 stars', score: 5, comment: 'Very helpful!' } },
    { source: 'crm', type: 'preference_noted', payload: { content: 'Customer prefers email over live chat for support interactions' } },
    { source: 'billing', type: 'account_update', payload: { content: 'Account upgraded to Enterprise tier, billing contact updated', tier: 'enterprise' } },
    { source: 'zendesk', type: 'ticket_opened', payload: { content: 'Billing discrepancy on last invoice — $50 overcharge', priority: 'medium' } },
    { source: 'billing', type: 'refund_issued', payload: { content: 'Refund of $50 issued to original payment method', amount: 50 } },
  ],
  'demo-coding-assistant': [
    { source: 'github', type: 'repo_context', payload: { content: 'Project uses Next.js 14 + Prisma ORM + PostgreSQL', stack: ['nextjs', 'prisma', 'postgres'] } },
    { source: 'chat', type: 'preference', payload: { content: 'Developer prefers functional style, no classes, explicit types' } },
    { source: 'github', type: 'code_review', payload: { content: 'Suggested refactoring: extract useDebounce hook from SearchInput component' } },
    { source: 'github', type: 'bug_report', payload: { content: 'Memory leak identified in useEffect — missing cleanup for WebSocket subscription' } },
    { source: 'github', type: 'pr_merged', payload: { content: 'PR #142 merged: fix useEffect cleanup, add tests for edge cases', tests_added: 3 } },
    { source: 'ci', type: 'build_result', payload: { content: 'Build passed: 142 tests green, 0 failures, coverage 87%', tests: 142, coverage: 87 } },
    { source: 'github', type: 'deployment', payload: { content: 'Deployed to staging environment — v2.4.0-rc1', environment: 'staging' } },
  ],
  'demo-sales-copilot': [
    { source: 'hubspot', type: 'discovery_call', payload: { content: 'Discovery call completed with VP Engineering at Acme Corp', duration_min: 45 } },
    { source: 'hubspot', type: 'proposal_sent', payload: { content: 'Proposal sent: 3 pricing tiers, recommended Growth plan at $50k ARR' } },
    { source: 'hubspot', type: 'objection_handled', payload: { content: 'Security objection addressed — shared SOC2 report and architecture docs' } },
    { source: 'hubspot', type: 'demo_scheduled', payload: { content: 'Technical demo scheduled with CTO for Thursday 2pm', attendees: ['CTO', 'VP Eng', 'Staff Eng'] } },
    { source: 'hubspot', type: 'deal_update', payload: { content: 'Budget approved: $50k ARR, awaiting legal review', amount: 50000, stage: 'negotiation' } },
    { source: 'hubspot', type: 'contract_activity', payload: { content: 'Contract redlined by legal — 2 minor changes to data retention clause' } },
    { source: 'email', type: 'follow_up', payload: { content: 'Follow-up email sent with revised contract and implementation timeline' } },
  ],
  'demo-devops-agent': [
    { source: 'datadog', type: 'alert', payload: { content: 'CPU spike detected on node-7 in us-east-1 cluster', severity: 'warning', node: 'node-7' } },
    { source: 'kubernetes', type: 'auto_scale', payload: { content: 'HPA auto-scaled deployment to 5 replicas (was 3)', replicas: 5 } },
    { source: 'argocd', type: 'rollback', payload: { content: 'Rollback triggered: v2.3.1 → v2.3.0 due to error rate spike', from: '2.3.1', to: '2.3.0' } },
    { source: 'datadog', type: 'recovery', payload: { content: 'Health checks restored — all endpoints returning 200', downtime_min: 4 } },
    { source: 'confluence', type: 'post_mortem', payload: { content: 'Post-mortem drafted: root cause was unoptimized DB query in new endpoint' } },
    { source: 'github', type: 'runbook_update', payload: { content: 'Runbook updated with new rollback procedure for stateful services' } },
    { source: 'terraform', type: 'infra_context', payload: { content: 'Infrastructure: 3 GKE clusters, SLA target 99.95% uptime', clusters: 3, sla: '99.95%' } },
  ],
  'demo-research-assistant': [
    { source: 'arxiv', type: 'paper_ingested', payload: { content: 'Paper ingested: "Attention Is All You Need" — Vaswani et al. 2017', arxiv_id: '1706.03762' } },
    { source: 'arxiv', type: 'paper_ingested', payload: { content: 'Paper ingested: "LoRA: Low-Rank Adaptation" — Hu et al. 2021', arxiv_id: '2106.09685' } },
    { source: 'notes', type: 'key_finding', payload: { content: 'Key finding: LoRA achieves comparable quality to full fine-tuning at 10x lower cost' } },
    { source: 'notes', type: 'comparison', payload: { content: 'Comparison table generated: LoRA vs Full FT vs Prefix Tuning vs Adapters' } },
    { source: 'notes', type: 'citation_graph', payload: { content: 'Citation graph expanded: 12 connected papers on parameter-efficient methods' } },
    { source: 'notion', type: 'export', payload: { content: 'Summary exported to Notion workspace — tagged: transformer-efficiency' } },
    { source: 'chat', type: 'preference', payload: { content: 'Researcher prefers arxiv papers over blog posts, values mathematical rigor' } },
  ],
}

// ─── Seed Logic ───

async function seedSubject(subjectId, episodes) {
  console.log(`\n📦 Seeding ${subjectId} (${episodes.length} episodes)...`)

  for (const ep of episodes) {
    await post('/v1/episodes', {
      subject_id: subjectId,
      source: ep.source,
      type: ep.type,
      payload: ep.payload,
    })
    process.stdout.write('.')
  }
  console.log(' ✓ episodes created')

  console.log(`  🧠 Compiling memories...`)
  try {
    await post('/v1/memories/compile', { subject_id: subjectId })
    console.log(`  ✓ memories compiled`)
  } catch (err) {
    console.log(`  ⚠ compile failed (will retry): ${err.message}`)
    // Retry once after a short delay
    await new Promise(r => setTimeout(r, 2000))
    try {
      await post('/v1/memories/compile', { subject_id: subjectId })
      console.log(`  ✓ memories compiled (retry)`)
    } catch {
      console.log(`  ✗ compile failed — skipping`)
    }
  }
}

async function main() {
  console.log(`🌊 Statewave Hero Seed — targeting ${BASE_URL}`)
  console.log('─'.repeat(50))

  // Health check
  try {
    const resp = await fetch(`${BASE_URL}/healthz`)
    if (!resp.ok) throw new Error(`Status ${resp.status}`)
    console.log('✓ Backend is healthy')
  } catch (err) {
    console.error(`✗ Backend unreachable at ${BASE_URL}:`, err.message)
    process.exit(1)
  }

  for (const [subjectId, episodes] of Object.entries(subjects)) {
    await seedSubject(subjectId, episodes)
  }

  console.log('\n' + '─'.repeat(50))
  console.log('✅ All demo subjects seeded!')
  console.log('   The hero visualization will now show real-time data.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
