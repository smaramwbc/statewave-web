import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })))
const WhyPage = lazy(() => import('./pages/WhyPage').then(m => ({ default: m.WhyPage })))
const UseCasesPage = lazy(() => import('./pages/UseCasesPage').then(m => ({ default: m.UseCasesPage })))
const ConnectorsPage = lazy(() => import('./pages/ConnectorsPage').then(m => ({ default: m.ConnectorsPage })))
const DevelopersPage = lazy(() => import('./pages/DevelopersPage').then(m => ({ default: m.DevelopersPage })))
const CookiesPage = lazy(() => import('./pages/CookiesPage').then(m => ({ default: m.CookiesPage })))
const LaunchPage = lazy(() => import('./pages/LaunchPage').then(m => ({ default: m.LaunchPage })))
const PressPage = lazy(() => import('./pages/PressPage').then(m => ({ default: m.PressPage })))
const DemoPage = lazy(() => import('./pages/DemoPage').then(m => ({ default: m.DemoPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage').then(m => ({ default: m.ImpressumPage })))
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
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
