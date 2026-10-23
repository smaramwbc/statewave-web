import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useChatWidget } from '../../lib/widget-context-api'
import type { ChatMessage, DocSource } from '../../lib/widget-context-api'
import { MarkdownMessage } from '../chat/MarkdownMessage'
import { safeUrl } from '../chat/safe-url'
import { SUGGESTIONS } from '../chat/suggestions'

const ROUNDS = SUGGESTIONS['statewave-support']

/** Past this, a pending reply gives way to the recorded conversation. */
const SLOW_MS = 8000

/** Shown when the live agent is slow or failing, so the hero never shows an
 *  error or a long spinner. Facts mirror the statewave README. */
const RECORDED: ChatMessage[] = [
  { role: 'user', content: 'How do I get started with Statewave?', timestamp: 0 },
  {
    role: 'assistant',
    timestamp: 1,
    content: [
      'One line gets you a running server:',
      '',
      '```bash',
      'npx @statewavedev/statewave',
      '```',
      '',
      'Prefer to run it yourself? Clone the repo and run `docker compose up -d`. That brings up Postgres (pgvector) and the API at `http://localhost:8100`, with migrations applied on start.',
      '',
      'Then install an SDK: `pip install statewave` for Python or `npm install @statewavedev/sdk` for TypeScript.',
    ].join('\n'),
    sources: [
      { doc_path: 'README.md', breadcrumb: 'Statewave › Run the server', url: 'https://github.com/smaramwbc/statewave#run-the-server' },
      { doc_path: 'getting-started.md', breadcrumb: 'Docs › Getting started', url: 'https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md' },
    ],
  },
]

function Sources({ sources }: { sources: DocSource[] }) {
  return (
    <div className="sw-chat__sources">
      <span>Sources</span>
      {sources.map((s) => {
        const safe = safeUrl(s.url)
        const label = s.breadcrumb || s.doc_path
        return safe ? (
          <a key={s.doc_path} href={safe} target="_blank" rel="noopener noreferrer" title={s.breadcrumb}>{label}</a>
        ) : (
          <em key={s.doc_path}>{label}</em>
        )
      })}
    </div>
  )
}

/** The real Statewave Support agent (the docs-grounded persona from the demo
 *  widget), embedded in the hero. Shares conversation state with the floating
 *  widget, so a chat started here carries on there. */
export function HeroChat() {
  const { statewaveMessages, isLoading, sendMessage, clearChat, enterSupportChannel } = useChatWidget()
  const [text, setText] = useState('')
  const [round, setRound] = useState(0)
  const [slow, setSlow] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => { enterSupportChannel() }, [enterSupportChannel])

  useEffect(() => {
    if (!isLoading) return
    const t = setTimeout(() => setSlow(true), SLOW_MS)
    return () => clearTimeout(t)
  }, [isLoading])

  const last = statewaveMessages[statewaveMessages.length - 1]
  const recorded = slow || !!(last?.error || last?.failed)
  const messages = recorded ? RECORDED : statewaveMessages
  const empty = messages.length === 0

  // Keep the newest message in view without scrolling the whole page.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isLoading])

  const send = (raw: string) => {
    const t = raw.trim()
    if (!t || isLoading) return
    setText('')
    // Leaving the recorded view: drop the failed exchange so it never shows.
    if (recorded) { clearChat(); setSlow(false) }
    void sendMessage(t)
  }
  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(text) }
  const pick = (t: string) => { send(t); setRound((r) => (r + 1) % ROUNDS.length) }
  return (
    <div className="sw-chat">
      <div className="sw-chat__head">
        <span className="sw-chat__brand">
          <span className="sw-chat__logo"><img src="/brand/icon.svg" alt="" width={20} height={20} /></span>
          <span>
            <b>Statewave Support</b>
          </span>
        </span>
        {!empty && !recorded && <button type="button" className="sw-chat__clear" onClick={clearChat}>New chat</button>}
      </div>

      <div className="sw-chat__body" ref={scroller} role="log" aria-live="polite" aria-label="Chat with Statewave Support">
        {empty ? (
          <div className="sw-chat__empty">
            <span className="sw-chat__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
            </span>
            <h3>Ask the Statewave docs</h3>
            <p>Setup, deployment, privacy or compiler questions. Every answer comes from the docs memory pack and cites its source. When something isn't covered, the agent says so.</p>
            <ul>
              <li><b>Cited</b>every claim</li>
              <li><b>Grounded</b>official docs</li>
              <li><b>Honest</b>about gaps</li>
            </ul>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={`${m.timestamp}-${i}`} className={`sw-chat__msg sw-chat__msg--${m.role}`}>
              <div className="sw-chat__bubble">
                {m.role === 'user' ? m.content : <div className="sw-chat__md"><MarkdownMessage content={m.content} /></div>}
              </div>
              {m.sources && m.sources.length > 0 && <Sources sources={m.sources} />}
            </div>
          ))
        )}
        {isLoading && !recorded && (
          <div className="sw-chat__msg sw-chat__msg--assistant" aria-label="Statewave Support is typing">
            <div className="sw-chat__bubble sw-chat__typing"><i /><i /><i /></div>
          </div>
        )}
      </div>

      <div className="sw-chat__foot">
        <div className="sw-chat__chips">
          {ROUNDS[round].map((s) => (
            <button key={s.text} type="button" className="sw-qchip" disabled={isLoading} onClick={() => pick(s.text)}>{s.text}</button>
          ))}
        </div>
        <form className="sw-chat__form" onSubmit={onSubmit}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask something…"
            aria-label="Ask Statewave Support"
            maxLength={500}
            autoComplete="off"
          />
          <button type="submit" className="sw-send" disabled={isLoading || !text.trim()} aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </form>
        {recorded && <p className="sw-chat__note">A recorded answer from Statewave Support.</p>}
      </div>
    </div>
  )
}
