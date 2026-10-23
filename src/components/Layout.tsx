import { Outlet, useLocation } from 'react-router'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { ScrollToTopButton } from './ScrollToTopButton'
import { ChatWidget } from './ChatWidget'
import { ClientOnly } from './ClientOnly'
import { SmoothScroll } from './SmoothScroll'

export function Layout() {
  // overflow-x-CLIP, not -hidden: `hidden` makes this div a scroll container,
  // which silently breaks `position: sticky` for every descendant — both
  // SectionNav rails (/benchmarks, /openrouter) scrolled away instead of
  // parking under the navbar. `clip` suppresses the same horizontal overflow
  // without establishing a scroll container.
  // The home page embeds its own grounded chat in the hero, so the floating pill would
  // be a second, duplicate entry point there. Every other page keeps it.
  const onHome = useLocation().pathname === '/'
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-clip">
      <ScrollToTop />
      <SmoothScroll />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      {/* Footer + the floating ChatWidget pill + ScrollToTopButton are all
          below the fold (and the chat widget is collapsed by default). Keep
          them out of the prerendered HTML so the static payload stays
          small — they paint on the client after hydration. */}
      <ClientOnly>
        <Footer />
        <ScrollToTopButton />
        {!onHome && <ChatWidget />}
      </ClientOnly>
    </div>
  )
}
