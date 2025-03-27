import { Routes, Route, HashRouter, useLocation } from 'react-router-dom'
import TranslatorPage from './pages/translator/TranslatorPage'
import CheckDependencies from './pages/checkDependencies/CheckDependencies'
import { VCContext } from './components/context/VCContext'
import { AzureSettingsContext } from './components/context/AzureSettingsContext'
import TranslationOverlay from './pages/translationOverlay/TranslationOverlay'
import { useEffect } from 'react'

const PUBLIC_URL = ''

const MainRoutes: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/translationOverlay') {
      document.body.classList.add('overlay-mode')
    } else {
      document.body.classList.remove('overlay-mode')
    }
  }, [location])

  return (
    <Routes>
      <Route path="/*" element={<CheckDependencies />} />
      <Route path="checking-dependencies" element={<CheckDependencies />} />
      <Route
        path="translator"
        element={
          <VCContext>
            <AzureSettingsContext>
              <TranslatorPage />
            </AzureSettingsContext>
          </VCContext>
        }
      />
      <Route path="translationOverlay" element={<TranslationOverlay />} />
      <Route
        path="*"
        element={
          <div>
            <h1>Are you lost? We all are</h1>
          </div>
        }
      />
    </Routes>
  )
}

function App(): JSX.Element {
  return (
    <HashRouter basename={PUBLIC_URL}>
      <MainRoutes />
    </HashRouter>
  )
}

export default App
