import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { WhyPage } from './pages/WhyPage'
import { DevelopersPage } from './pages/DevelopersPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/why" element={<WhyPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
      </Route>
    </Routes>
  )
}
