
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { CodeCopyButton } from './CodeCopyButton'

const INSTALL_NPX = 'npx @statewavedev/statewave'
const INSTALL_UNIX = 'curl -fsSL https://www.statewave.ai/install | sh'
const INSTALL_WIN = 'powershell -Command "irm https://www.statewave.ai/install.ps1 | iex"'

type InstallTab = 'node' | 'unix' | 'windows'

const INSTALL_TABS: { id: InstallTab; label: string; cmd: string; prompt: string }[] = [
  { id: 'node', label: 'Node', cmd: INSTALL_NPX, prompt: '$' },
  { id: 'unix', label: 'macOS / Linux', cmd: INSTALL_UNIX, prompt: '$' },
  { id: 'windows', label: 'Windows', cmd: INSTALL_WIN, prompt: '>' },
]

export function HeroInstallCommand({ centered = false }: { centered?: boolean }) {
  const [tab, setTab] = useState<InstallTab>(() =>
    typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent) ? 'windows' : 'node'
  )
  const active = INSTALL_TABS.find((t) => t.id === tab)!
  return (
    <div>
      {/* Tab strip — the command pill is inline-flex, so it centers under a
          text-center parent on its own; the flex rows need justify-center. */}
      <div className={`flex gap-1 mb-1.5 ${centered ? 'justify-center' : ''}`}>
        {INSTALL_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors',
              tab === id
                ? 'bg-accent/10 text-accent'
                : 'text-theme-muted hover:text-theme-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Command pill */}
      <div className="inline-flex items-center gap-2 rounded-lg border border-theme-border/70 bg-surface-2/70 backdrop-blur-sm px-3.5 py-2 font-mono text-xs sm:text-sm max-w-full">
        <span className="select-none text-accent/70 shrink-0">{active.prompt}</span>
        <code className="overflow-x-auto whitespace-nowrap text-theme-secondary">{active.cmd}</code>
        <CodeCopyButton code={active.cmd} label="Copy install command" />
      </div>

      {/* Docs link — "no account / offline" already covered by the context
          line above, so no trust chips here. */}
      <div className={`mt-2 text-[11px] text-theme-muted ${centered ? 'text-center' : ''}`}>
        <Link to="/developers" className="hover:text-accent transition-colors underline-offset-2 hover:underline">
          Full guide →
        </Link>
      </div>
    </div>
  )
}
