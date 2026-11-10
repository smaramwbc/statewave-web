import { DOCS, DOCS_REPO, EXAMPLES, GITHUB } from './home/links'

/* Link groups shared by the header dropdowns and the footer. */
// The design links to pages this site doesn't have (pricing, a compare index,
// per-solution pages), so those are left out or point at the nearest existing
// page, the same way home/links.ts handles it.
export const COLUMNS: { title: string; items: [string, string][] }[] = [
  { title: 'Product', items: [['How it works', '/product'], ['Governance', '/#governance'], ['Benchmarks', '/benchmarks'], ['Connectors', '/connectors'], ['OpenRouter proxy', '/openrouter']] },
  { title: 'Solutions', items: [['Support agents', '/#solutions'], ['Coding agents', '/use-cases'], ['Multi-agent memory', '/use-cases/multi-agent-memory'], ['Personal assistants', '/use-cases/personal-assistant-memory'], ['Shop assistants', '/use-cases/grounded-shop-assistant'], ['All use cases', '/use-cases']] },
  { title: 'Developers', items: [['Docs', DOCS_REPO], ['Quickstart', DOCS], ['API reference', 'https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md'], ['Python SDK', 'https://pypi.org/project/statewave/'], ['TypeScript SDK', 'https://www.npmjs.com/package/@statewavedev/sdk'], ['Examples', EXAMPLES], ['Changelog', `${GITHUB}/releases`]] },
  { title: 'Compare', items: [['All comparisons', '/vs'], ['vs Mem0', '/vs/mem0'], ['vs Zep', '/vs/zep'], ['vs Letta', '/vs/letta'], ['vs Supermemory', '/vs/supermemory'], ['Why Statewave', '/why']] },
  { title: 'Resources', items: [['Blog', '/blog'], ['Statewave Guide', '/blog/statewave-guide'], ['White paper', '/whitepaper'], ['FAQ', '/faq'], ['Live demo', '/demo'], ['GitHub Discussions', `${GITHUB}/discussions`]] },
  { title: 'Company', items: [['About', '/about'], ['Contact', '/contact'], ['Press kit', '/press'], ['Security', 'mailto:security@statewave.ai'], ['Enterprise support', 'mailto:licensing@statewave.ai']] },
]
