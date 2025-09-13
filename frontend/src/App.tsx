import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { Pipeline } from '@/pages/pipeline/Pipeline'
import { DealDetail } from '@/pages/deals/DealDetail'
import { Companies } from '@/pages/companies/Companies'
import { Contacts } from '@/pages/contacts/Contacts'
import { Interactions } from '@/pages/interactions/Interactions'
import { Tasks } from '@/pages/tasks/Tasks'
import { Documents } from '@/pages/documents/Documents'
import { NDAs } from '@/pages/ndas/NDAs'
import { Toaster } from '@/components/ui/toaster'

function App() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/deals/:id" element={<DealDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/interactions" element={<Interactions />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/ndas" element={<NDAs />} />
          <Route path="/" element={<Navigate to="/pipeline" replace />} />
          <Route path="*" element={<Navigate to="/pipeline" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  )
}

export default App