import { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { Home } from "./pages/Home";

/**
 * Strona główna ładowana od razu (pierwsze wejście), pozostałe podstrony
 * dociągane na żądanie — mniejszy bundle startowy.
 */
const loadOferta = () => import("./pages/Oferta");
const loadSystemy = () => import("./pages/Systemy");
const loadRealizacje = () => import("./pages/Realizacje");
const loadONas = () => import("./pages/ONas");
const loadKontakt = () => import("./pages/Kontakt");

const Oferta = lazy(() => loadOferta().then((m) => ({ default: m.Oferta })));
const Systemy = lazy(() => loadSystemy().then((m) => ({ default: m.Systemy })));
const SystemDetail = lazy(() => import("./pages/SystemDetail").then((m) => ({ default: m.SystemDetail })));
const KategoriaDetail = lazy(() =>
  import("./pages/KategoriaDetail").then((m) => ({ default: m.KategoriaDetail }))
);
const ProducentDetail = lazy(() =>
  import("./pages/ProducentDetail").then((m) => ({ default: m.ProducentDetail }))
);
const Realizacje = lazy(() => loadRealizacje().then((m) => ({ default: m.Realizacje })));
const RealizacjaDetail = lazy(() =>
  import("./pages/RealizacjaDetail").then((m) => ({ default: m.RealizacjaDetail }))
);
const ONas = lazy(() => loadONas().then((m) => ({ default: m.ONas })));
const Kontakt = lazy(() => loadKontakt().then((m) => ({ default: m.Kontakt })));
const PolitykaPrywatnosci = lazy(() =>
  import("./pages/PolitykaPrywatnosci").then((m) => ({ default: m.PolitykaPrywatnosci }))
);
const Cookies = lazy(() => import("./pages/Cookies").then((m) => ({ default: m.Cookies })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

/** Neutralne tło na czas dociągania podstrony — bez migotania i spinnerów. */
function RouteFallback() {
  return <div className="min-h-[70svh] bg-void" />;
}

/**
 * Podstrony z menu dociągane w tle, gdy przeglądarka nie ma nic do roboty.
 *
 * Bundle startowy się nie zmienia — pobranie rusza dopiero po załadowaniu
 * strony. Bez tego pierwsze kliknięcie w menu czekało na sieć i pokazywało
 * pusty ekran z samą stopką (uwaga klientki: „dużo się ładuje”).
 */
function usePrefetchPages() {
  useEffect(() => {
    const prefetch = () => {
      for (const load of [loadOferta, loadSystemy, loadRealizacje, loadONas, loadKontakt]) {
        // Błąd sieci tutaj nie jest błędem strony — przy kliknięciu `lazy` spróbuje ponownie.
        load().catch(() => {});
      }
    };

    // Safari nie ma `requestIdleCallback` — tam zwykłe opóźnienie po starcie.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(prefetch, 2500);
    return () => window.clearTimeout(timer);
  }, []);
}

function App() {
  usePrefetchPages();

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="oferta" element={<Oferta />} />
                <Route path="systemy" element={<Systemy />} />
                {/* Segmenty stałe muszą stać przed trasą ze slugiem systemu */}
                <Route path="systemy/kategoria/:slug" element={<KategoriaDetail />} />
                <Route path="systemy/producent/:slug" element={<ProducentDetail />} />
                <Route path="systemy/:slug" element={<SystemDetail />} />
                <Route path="realizacje" element={<Realizacje />} />
                <Route path="realizacje/:slug" element={<RealizacjaDetail />} />
                <Route path="o-nas" element={<ONas />} />
                <Route path="kontakt" element={<Kontakt />} />
                <Route path="polityka-prywatnosci" element={<PolitykaPrywatnosci />} />
                <Route path="cookies" element={<Cookies />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
