import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { statewaveApiPlugin } from './server/vite-plugin'

export default defineConfig(({ mode }) => {
  // The api/*.ts edge handlers read server-only env vars via process.env
  // (STATEWAVE_URL, STATEWAVE_API_KEY). Vite's built-in .env loading only
  // exposes VITE_* to the client bundle, so explicitly copy non-VITE_ keys
  // from .env / .env.local / .env.<mode> into process.env. Shell env wins
  // over .env.* (so `STATEWAVE_URL=http://localhost:8100 npm run dev`
  // continues to work).
  const fileEnv = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(fileEnv)) {
    if (k.startsWith('VITE_')) continue
    if (process.env[k] === undefined) process.env[k] = v
  }

  // Default the upstream Statewave URL to the local docker-compose server
  // so `npm run dev` is a true single-process local stack out of the box.
  // Override with .env.local (STATEWAVE_URL=https://statewave-api.fly.dev)
  // when iterating the website against production data.
  if (!process.env.STATEWAVE_URL) {
    process.env.STATEWAVE_URL = 'http://localhost:8100'
  }

  return {
    plugins: [
      // MDX must run before @vitejs/plugin-react so the .mdx → JSX
      // transform happens first; plugin-react then handles the resulting
      // JSX exactly like a normal .tsx file.
      //
      // Plugins enabled on the MDX pipeline (small, all support SSR):
      //   * remark-frontmatter         — strips the YAML --- block so
      //                                  it doesn't render as text.
      //   * remark-mdx-frontmatter     — exposes the YAML as a named
      //                                  `frontmatter` export from each
      //                                  .mdx file, so the loader can
      //                                  read post metadata without a
      //                                  second pass through gray-matter.
      //   * remark-gfm                 — GitHub-flavoured tables /
      //                                  task-lists / strikethrough.
      //   * rehype-slug                — auto-id every heading.
      //   * rehype-autolink-headings   — wrap headings in anchor links
      //                                  so readers can deep-link to
      //                                  any section of a post.
      {
        enforce: 'pre',
        ...mdx({
          remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
          providerImportSource: '@mdx-js/react',
        }),
      },
      react(),
      tailwindcss(),
      statewaveApiPlugin(),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
