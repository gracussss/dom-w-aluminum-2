import { StrictMode } from 'react'
import { MotionConfig } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SmoothScroll } from './lib/SmoothScroll'
import { LoaderGate } from './components/Loader'
import { CatalogProvider } from './catalog'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Reguła CSS `prefers-reduced-motion` nie dotyka framer-motion — ten
          animuje w JavaScripcie. `reducedMotion="user"` wyłącza ruch
          (przesunięcia, skalowanie) w całym drzewie, zostawiając samo
          przenikanie. Bez tego pojedyncze komponenty musiałyby o tym pamiętać
          każdy z osobna, a większość nie pamiętała. */}
      <MotionConfig reducedMotion="user">
        {/* Zrodlo danych katalogu dla calego drzewa - podmiana na API bez zmian w widokach */}
        <CatalogProvider>
          <SmoothScroll>
            <LoaderGate>
              <App />
            </LoaderGate>
          </SmoothScroll>
        </CatalogProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
