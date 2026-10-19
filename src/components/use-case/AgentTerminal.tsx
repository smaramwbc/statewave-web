import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { GitCommitHorizontal } from 'lucide-react'
import { Icon } from '../home/ui'
import { usePrefersReducedMotion } from '../home/hooks'

/* The coding-agents hero: three things the team wrote down, wired into a Claude Code session.
 * The question types itself, get_context runs, each source lights up and sends its signal down its
 * wire, and the answer arrives citing all three. Server HTML and reduced motion get the finished
 * exchange; the sequence plays once, then the wires keep a slow pulse. Styles in coding-agents.css. */

const SUBJECT = 'repo:acme.widgets'
const QUESTION = 'Where should the new export job run?'

const SOURCES: Array<{ mark: ReactNode; title: string; kind: string; wire: string }> = [
  { mark: <GitCommitHorizontal size={18} aria-hidden="true" />, title: 'a41c9e2', kind: 'git.commit', wire: 'M0 40 C 70 40 50 160 120 160' },
  { mark: <Icon name="github" size={18} />, title: 'PR #212 review', kind: 'github.pr.review', wire: 'M0 160 L 120 160' },
  { mark: <Icon name="markdown" size={18} />, title: 'ADR 007', kind: 'docs.adr', wire: 'M0 280 C 70 280 50 160 120 160' },
]

/* 0 idle · 1 typing · 2 get_context runs · 3–5 a source lights up · 6 result · 7 answer (final) */
const FINAL = 7
const WAIT = [500, 0, 300, 260, 260, 700, 450]

export function AgentTerminal() {
  const rm = usePrefersReducedMotion()
  const [phase, setPhase] = useState(FINAL)
  const [typed, setTyped] = useState(QUESTION.length)

  // The server renders the finished exchange; on the client the sequence starts over and plays once.
  useEffect(() => {
    if (rm) return
    const id = setTimeout(() => { setPhase(0); setTyped(0) }, 0)
    return () => clearTimeout(id)
  }, [rm])

  useEffect(() => {
    if (phase >= FINAL) return
    if (phase === 1) {
      const id = typed < QUESTION.length
        ? setTimeout(() => setTyped(typed + 1), 28)
        : setTimeout(() => setPhase(2), 350)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setPhase(phase + 1), WAIT[phase])
    return () => clearTimeout(id)
  }, [phase, typed])

  const lit = (i: number) => phase >= 3 + i

  return (
    <figure className="ca-agent" data-phase={phase}>
      <figcaption className="sr-only">
        In Claude Code, a developer asks: {QUESTION} The agent calls statewave get_context for {SUBJECT}, which
        returns memories from commit a41c9e2, the PR #212 review and ADR 007, and answers from them.
      </figcaption>
      <div className="ca-agent__stage" aria-hidden="true">
        <ul className="ca-agent__sources">
          {SOURCES.map((s, i) => (
            <li key={s.kind} data-on={lit(i) || undefined}>
              <span className="ca-agent__mark">{s.mark}</span>
              <span className="ca-agent__label"><b className="sw-mono">{s.title}</b><code className="sw-mono">{s.kind}</code></span>
            </li>
          ))}
        </ul>

        <div className="ca-agent__wires">
          <svg viewBox="0 0 120 320" width="120" height="320">
            {SOURCES.map((s, i) => <path key={s.kind} d={s.wire} data-on={lit(i) || undefined} />)}
          </svg>
          {SOURCES.map((s, i) => lit(i) && [0, 1].map(k => (
            <i key={`${s.kind}-${k}`} style={{ offsetPath: `path("${s.wire}")`, animationDelay: `${k * 1.2 + i * 0.15}s` }} />
          )))}
        </div>

        <div className="ca-agent__term">
          <div className="ca-agent__bar"><i /><i /><i /><span>Claude Code · acme/widgets</span></div>
          <div className="ca-agent__body">
            <p className="ca-agent__q">
              <span>›</span> {QUESTION.slice(0, typed)}{phase <= 1 && <span className="ca-agent__caret" />}
            </p>
            {phase >= 2 && (
              <p className="ca-agent__tool">
                <b>●</b> statewave · get_context(<em>{SUBJECT}</em>){phase < 6 && <span className="ca-agent__wait" />}
              </p>
            )}
            {phase >= 6 && <p className="ca-agent__result">└ 3 memories, ranked, each with its source</p>}
            {phase >= FINAL && (
              <div className="ca-agent__answer">
                <p>
                  On the existing job queue. It runs on Postgres advisory locks, not Redis (ADR 007), and failed jobs
                  already retry with backoff (a41c9e2). Write its tests in Vitest, as the PR #212 review asked.
                </p>
                <div className="ca-agent__cites">
                  <span>Sources</span>
                  <em className="sw-mono">ADR 007</em>
                  <em className="sw-mono">a41c9e2</em>
                  <em className="sw-mono">PR #212 review</em>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </figure>
  )
}
