import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Email from './pages/Email'
import Pricing from './pages/Pricing'

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/email" element={<Email />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </>
  )
} 