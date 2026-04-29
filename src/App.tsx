import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })))
const WhyPage = lazy(() => import('./pages/WhyPage').then(m => ({ default: m.WhyPage })))
const DevelopersPage = lazy(() => import('./pages/DevelopersPage').then(m => ({ default: m.DevelopersPage })))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/why" element={<WhyPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        {/* Admin — standalone layout, no marketing chrome */}
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </Suspense>
  )
}
