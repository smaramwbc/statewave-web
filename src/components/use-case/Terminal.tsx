import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCopy, usePrefersReducedMotion } from '../home/hooks'

/* The copyable command and the tabbed terminal that types its command, for the v8 use-case pages.
 * The connector pages (on their own branch) carry the same two pieces inside ConnectorPage; once
 * both are merged they can share this file. Styles live in coding-agents.css. */

export interface TerminalTab {
  label: string
  /** Shown as `export NAME=value` lines above the command. */
  env: string[]
  cmd: string
  output?: string
  outputLabel?: string
  notes?: string[]
}

export function CopyCmd({ cmd, hero }: { cmd: string; hero?: boolean }) {
  const [done, copy] = useCopy(cmd)
  return (
    <div className={hero ? 'sw-hero__cmd ca-hero-cmd' : 'ca-cmd'}>
      <span aria-hidden="true" className={hero ? 'sw-hero__prompt' : undefined}>$</span>
      <code className="sw-mono">{cmd}</code>
      <button type="button" className={hero ? 'sw-hero__copy' : undefined} onClick={copy} aria-label={done ? 'Copied' : 'Copy command'}>
        {done ? <Check size={hero ? 18 : 16} aria-hidden="true" /> : <Copy size={hero ? 18 : 16} aria-hidden="true" />}
      </button>
    </div>
  )
}

/** Types `text` two characters at a time. Remount (key) to start again. */
function useTyped(text: string) {
  const rm = usePrefersReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (rm || n >= text.length) return
    const id = setTimeout(() => setN(n + 2), 18)
    return () => clearTimeout(id)
  }, [n, text, rm])
  const shown = rm ? text.length : Math.min(n, text.length)
  return [text.slice(0, shown), shown >= text.length] as const
}

function TermBody({ tab }: { tab: TerminalTab }) {
  const [typed, done] = useTyped(tab.cmd)
  return (
    <>
      <pre className="ca-term__body">
        {tab.env.map(e => <span key={e} className="ca-term__env">export {e}{'\n'}</span>)}
        {tab.env.length > 0 && '\n'}<span className="ca-term__ps">$ </span>{typed}<span className="ca-term__caret" />
        {tab.output && (
          <span className="ca-term__out" data-on={done || undefined}>
            {'\n\n'}{tab.outputLabel && <span className="ca-term__label"># {tab.outputLabel}{'\n'}</span>}{tab.output}
          </span>
        )}
      </pre>
      {tab.notes && (
        <ul className="ca-term__notes">
          {tab.notes.map(n => <li key={n}><Check size={14} aria-hidden="true" />{n}</li>)}
        </ul>
      )}
    </>
  )
}

export function Terminal({ tabs }: { tabs: TerminalTab[] }) {
  const [t, setT] = useState(0)
  const tab = tabs[t]
  const full = [...tab.env.map(e => `export ${e}`), ...(tab.env.length ? [''] : []), tab.cmd].join('\n')
  const [copied, copy] = useCopy(full)
  return (
    <div className="ca-term">
      <div className="ca-term__bar">
        <div className="ca-term__tabs" role="tablist">
          {tabs.map((x, k) => (
            <button key={x.label} type="button" role="tab" aria-selected={k === t} onClick={() => setT(k)}>{x.label}</button>
          ))}
        </div>
        <button type="button" className="ca-term__copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <TermBody key={t} tab={tab} />
    </div>
  )
}
