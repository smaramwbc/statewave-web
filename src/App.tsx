import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })))
const WhyPage = lazy(() => import('./pages/WhyPage').then(m => ({ default: m.WhyPage })))
const UseCasesPage = lazy(() => import('./pages/UseCasesPage').then(m => ({ default: m.UseCasesPage })))
const DevelopersPage = lazy(() => import('./pages/DevelopersPage').then(m => ({ default: m.DevelopersPage })))
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
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <SpeedInsights />
    </Suspense>
  )
}
