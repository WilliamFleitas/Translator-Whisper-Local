import { Routes, Route, BrowserRouter } from 'react-router-dom'
import TranslatorPage from './pages/translator/TranslatorPage'
import CheckDependencies from './pages/checkDependencies/CheckDependencies'
import { VCContext } from './components/context/VCContext'

const PUBLIC_URL = ''

function AppRoutes(): JSX.Element {
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route path="/*" element={<CheckDependencies />} />
        <Route path="checking-dependencies" element={<CheckDependencies />} />
        <Route
          path="translator"
          element={
            <VCContext>
              <TranslatorPage />
            </VCContext>
          }
        />
        <Route
          path="*"
          element={
            <div>
              <h1>Are you lost? We all are</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
