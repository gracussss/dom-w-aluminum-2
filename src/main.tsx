import { StrictMode } from 'react'
import { MotionConfig } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SmoothScroll } from './lib/SmoothScroll'
import { CatalogProvider } from './catalog'
import { ErrorBoundary } from './components/ErrorBoundary'

/*! Alukoncept – strona firmowa. Projekt i realizacja: Gracjan Kubala.
    © 2026 Gracjan Kubala. Wszelkie prawa zastrzeżone. */

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Ostatnia linia obrony: błąd poza treścią podstrony (np. w nagłówku). */}
    <ErrorBoundary variant="full">
      <BrowserRouter>
        {/* Reguła CSS `prefers-reduced-motion` nie dotyka framer-motion — ten
            animuje w JavaScripcie. `reducedMotion="user"` wyłącza ruch
            (przesunięcia, skalowanie) w całym drzewie, zostawiając samo
            przenikanie. Bez tego pojedyncze komponenty musiałyby o tym pamiętać
            każdy z osobna, a większość nie pamiętała. */}
        <MotionConfig reducedMotion="user">
          {/* Zrodlo danych katalogu dla calego drzewa - podmiana na API bez zmian w widokach */}
          <CatalogProvider>
            {/* Bez ekranu startowego z otwierającym się oknem — klientka
                (październik 2026): „trochę takie przejście do aplikacji”.
                Strona pokazuje się od razu, hero ma tylko własne wejście. */}
            <SmoothScroll>
              <App />
            </SmoothScroll>
          </CatalogProvider>
        </MotionConfig>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
