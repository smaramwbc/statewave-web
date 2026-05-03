import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { ScrollToTopButton } from './ScrollToTopButton'
import { ChatWidget } from './ChatWidget'

export function Layout() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden">
      <ScrollToTop />
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
      <Footer />
      <ScrollToTopButton />
      <ChatWidget />
    </div>
  )
}
