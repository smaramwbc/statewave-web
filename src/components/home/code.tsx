import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCopy } from './hooks'

/** Tiny highlighter: comments, strings, keywords, flags, numbers, calls. */
const TOKEN = /(#[^\n]*|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(from|import|with|as|const|await|new|True|true|curl)\b|(-[XHd])(?=\s)|\b(\d+)\b|([A-Za-z_]\w*)(?=\()/g
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of code.matchAll(TOKEN)) {
    const at = m.index ?? 0
    if (at > last) out.push(code.slice(last, at))
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] || m[5] ? 'n' : 'f'
    out.push(<span key={at} className={`sw-tk--${cls}`}>{m[0]}</span>)
    last = at + m[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

/** Highlighted source, memoised per string. */
export function Code({ text }: { text: string }) {
  return <>{useMemo(() => highlight(text), [text])}</>
}

export function CopyBtn({ text, className, label = 'Copy command' }: { text: string; className?: string; label?: string }) {
  const [done, copy] = useCopy(text)
  return <button type="button" className={className} aria-label={done ? 'Copied' : label} title={done ? 'Copied' : 'Copy'} onClick={copy}>{done ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}</button>
}
