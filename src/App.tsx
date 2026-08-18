import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })))
const WhyPage = lazy(() => import('./pages/WhyPage').then(m => ({ default: m.WhyPage })))
const UseCasesPage = lazy(() => import('./pages/UseCasesPage').then(m => ({ default: m.UseCasesPage })))
const MultiAgentMemoryPage = lazy(() => import('./pages/MultiAgentMemoryPage').then(m => ({ default: m.MultiAgentMemoryPage })))
const PersonalAssistantMemoryPage = lazy(() => import('./pages/PersonalAssistantMemoryPage').then(m => ({ default: m.PersonalAssistantMemoryPage })))
const MultiAgentSharedContextPage = lazy(() => import('./pages/MultiAgentSharedContextPage').then(m => ({ default: m.MultiAgentSharedContextPage })))
const GroundedShopAssistantPage = lazy(() => import('./pages/GroundedShopAssistantPage').then(m => ({ default: m.GroundedShopAssistantPage })))
const StatewaveVsMem0Page = lazy(() => import('./pages/StatewaveVsMem0Page').then(m => ({ default: m.StatewaveVsMem0Page })))
const StatewaveVsLettaPage = lazy(() => import('./pages/StatewaveVsLettaPage').then(m => ({ default: m.StatewaveVsLettaPage })))
const StatewaveVsZepPage = lazy(() => import('./pages/StatewaveVsZepPage').then(m => ({ default: m.StatewaveVsZepPage })))
const ConnectorsPage = lazy(() => import('./pages/ConnectorsPage').then(m => ({ default: m.ConnectorsPage })))
const DevelopersPage = lazy(() => import('./pages/DevelopersPage').then(m => ({ default: m.DevelopersPage })))
const CookiesPage = lazy(() => import('./pages/CookiesPage').then(m => ({ default: m.CookiesPage })))
const LaunchPage = lazy(() => import('./pages/LaunchPage').then(m => ({ default: m.LaunchPage })))
const BenchmarksPage = lazy(() => import('./pages/BenchmarksPage').then(m => ({ default: m.BenchmarksPage })))
const PressPage = lazy(() => import('./pages/PressPage').then(m => ({ default: m.PressPage })))
const WhitepaperPage = lazy(() => import('./pages/WhitepaperPage').then(m => ({ default: m.WhitepaperPage })))
const DemoPage = lazy(() => import('./pages/DemoPage').then(m => ({ default: m.DemoPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage').then(m => ({ default: m.ImpressumPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })))
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage').then(m => ({ default: m.BlogIndexPage })))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/why" element={<WhyPage />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/use-cases/multi-agent-memory" element={<MultiAgentMemoryPage />} />
          <Route path="/use-cases/personal-assistant-memory" element={<PersonalAssistantMemoryPage />} />
          <Route path="/use-cases/multi-agent-shared-context" element={<MultiAgentSharedContextPage />} />
          <Route path="/use-cases/grounded-shop-assistant" element={<GroundedShopAssistantPage />} />
          <Route path="/vs/mem0" element={<StatewaveVsMem0Page />} />
          <Route path="/vs/letta" element={<StatewaveVsLettaPage />} />
          <Route path="/vs/zep" element={<StatewaveVsZepPage />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/benchmarks" element={<BenchmarksPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/whitepaper" element={<WhitepaperPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
