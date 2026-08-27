import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { Home } from "./pages/Home";

/**
 * Strona główna ładowana od razu (pierwsze wejście), pozostałe podstrony
 * dociągane na żądanie — mniejszy bundle startowy.
 */
const Oferta = lazy(() => import("./pages/Oferta").then((m) => ({ default: m.Oferta })));
const Systemy = lazy(() => import("./pages/Systemy").then((m) => ({ default: m.Systemy })));
const SystemDetail = lazy(() => import("./pages/SystemDetail").then((m) => ({ default: m.SystemDetail })));
const KategoriaDetail = lazy(() =>
  import("./pages/KategoriaDetail").then((m) => ({ default: m.KategoriaDetail }))
);
const ProducentDetail = lazy(() =>
  import("./pages/ProducentDetail").then((m) => ({ default: m.ProducentDetail }))
);
const Realizacje = lazy(() => import("./pages/Realizacje").then((m) => ({ default: m.Realizacje })));
const RealizacjaDetail = lazy(() =>
  import("./pages/RealizacjaDetail").then((m) => ({ default: m.RealizacjaDetail }))
);
const ONas = lazy(() => import("./pages/ONas").then((m) => ({ default: m.ONas })));
const Kontakt = lazy(() => import("./pages/Kontakt").then((m) => ({ default: m.Kontakt })));
const PolitykaPrywatnosci = lazy(() =>
  import("./pages/PolitykaPrywatnosci").then((m) => ({ default: m.PolitykaPrywatnosci }))
);
const Cookies = lazy(() => import("./pages/Cookies").then((m) => ({ default: m.Cookies })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

/** Neutralne tło na czas dociągania podstrony — bez migotania i spinnerów. */
function RouteFallback() {
  return <div className="min-h-[70svh] bg-void" />;
}

function App() {
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
