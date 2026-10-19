import type { Connector, Group } from './types'

/** Every connector file in this folder registers itself: add a file, get a page. */
const modules = import.meta.glob<Record<string, unknown>>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true })

export const CONNECTORS: Record<string, Connector> = {}
for (const mod of Object.values(modules)) {
  for (const value of Object.values(mod)) {
    if (value && typeof value === 'object' && 'slug' in value) CONNECTORS[(value as Connector).slug] = value as Connector
  }
}

/** The /connectors index order: groups first, then connectors within each group. */
export const GROUPS: Array<{ group: Group; slugs: string[] }> = [
  { group: 'Code', slugs: ['github', 'gitlab', 'bitbucket', 'gitea', 'azure-devops'] },
  { group: 'Team & communication', slugs: ['slack', 'discord', 'gmail'] },
  { group: 'Support', slugs: ['zendesk', 'intercom', 'freshdesk'] },
  { group: 'Knowledge', slugs: ['markdown', 'notion'] },
  { group: 'Workflow', slugs: ['jira', 'n8n', 'zapier'] },
  { group: 'MCP', slugs: ['mcp-server'] },
  { group: 'Databases', slugs: ['database'] },
]
