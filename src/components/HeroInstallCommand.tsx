
import { useState } from 'react'
import { Link } from 'react-router'

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

type HeroInstallCommandProps = {
  centered?: boolean
  showGuide?: boolean
}

export function HeroInstallCommand({
  centered = false,
  showGuide = true,
}: HeroInstallCommandProps) {
  const [tab, setTab] = useState<InstallTab>(() =>
    typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent)
      ? 'windows'
      : 'node'
  )

  const active = INSTALL_TABS.find((t) => t.id === tab)!

  return (
    <div className={`w-full min-w-0 ${centered ? 'text-center' : ''}`}>
      <div
        className={`mb-3 flex flex-wrap gap-1.5 ${
          centered ? 'justify-center' : ''
        }`}
      >
        {INSTALL_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'rounded-md px-3 py-1 text-[11px] font-semibold transition-colors sm:text-[12px]',
              tab === id
                ? 'bg-accent/15 text-accent'
                : 'text-theme-muted hover:bg-surface-2/60 hover:text-theme-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={[
          'mx-auto inline-flex max-w-full min-w-0 items-center gap-2 rounded-xl',
          'border border-[var(--theme-button-secondary-border)]',
          'bg-surface-2/85 px-4 py-3 font-mono',
          'install-cmd-field backdrop-blur-sm',
          'sm:gap-3 sm:px-5 sm:py-3.5',
        ].join(' ')}
      >
        <span className="shrink-0 select-none text-accent">
          {active.prompt}
        </span>

        <code
          className={[
            'min-w-0 overflow-x-auto whitespace-nowrap text-left tracking-[-0.02em] text-theme-primary',
            tab === 'windows'
              ? 'max-w-[48rem] text-[10px] sm:text-[11px] md:text-[12px]'
              : 'text-[12px] sm:text-[13px] lg:text-sm',
          ].join(' ')}
        >
          {active.cmd}
        </code>

        <div className="shrink-0">
          <CodeCopyButton
            code={active.cmd}
            label="Copy install command"
          />
        </div>
      </div>

      {showGuide && (
        <div
          className={`mt-3 text-[12px] text-theme-muted ${
            centered ? 'text-center' : ''
          }`}
        >
          <Link
            to="/developers"
            className="font-medium underline underline-offset-4 decoration-theme-border-hover transition-colors hover:text-accent hover:decoration-accent"
          >
            Full guide →
          </Link>
        </div>
      )}
    </div>
  )
}
