import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { systems } from './src/catalog/dataset'
import { categories, manufacturers } from './src/catalog/taxonomy'
import { realizations } from './src/data/realizations'
import { images } from './src/data/images'
import { SIZES_FULL, responsiveSrcSet } from './src/lib/responsiveImage'

/* ------------------------------------------------------------------
   START POBIERANIA TŁA HERO

   Tło pierwszego ekranu jest największym elementem strony (LCP) i leży
   na obcym serwerze. Bez tego bloku przeglądarka dowiaduje się o nim
   dopiero po pobraniu i wykonaniu bundla — traci połączenie z hostem
   i kilkaset milisekund na starcie.

   Adres bierzemy z src/data/images.ts, nie przepisujemy go do HTML-a:
   po podmianie zdjęcia na materiał własny firmy nic tu nie zostaje
   nieaktualne.
   ------------------------------------------------------------------ */
function heroPreload(): Plugin {
  return {
    name: 'dwa-hero-preload',
    transformIndexHtml() {
      const srcSet = responsiveSrcSet(images.heroBg)
      const origin = images.heroBg.startsWith('http') ? new URL(images.heroBg).origin : null

      return [
        // Uścisk dłoni z hostem zdjęć równolegle do pobierania bundla.
        ...(origin
          ? [{ tag: 'link', attrs: { rel: 'preconnect', href: origin, crossorigin: '' }, injectTo: 'head-prepend' as const }]
          : []),
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'image',
            href: images.heroBg,
            ...(srcSet ? { imagesrcset: srcSet, imagesizes: SIZES_FULL } : {}),
            fetchpriority: 'high',
          },
          injectTo: 'head' as const,
        },
      ]
    },
  }
}

/* ------------------------------------------------------------------
   SITEMAP

   Powstaje przy buildzie z tych samych danych, z których zbudowany jest
   katalog — nie da się dodać systemu i zapomnieć o mapie strony.

   Poza mapą zostają karty systemów o nazwie roboczej (puste parametry, nie ma
   czego indeksowac) oraz realizacje poglądowe (`verified: false`) — to zdjęcia
   z banku, a nie obiekty wykonane przez firmę. Jedne i drugie wracają
   automatycznie, gdy dane zostaną potwierdzone w plikach źródłowych.

   Adres produkcyjny bierzemy z VITE_SITE_URL. Bez niego mapa nie powstaje —
   domeny nie zgadujemy, a sitemapa ze zmyslonym adresem jest gorsza niz jej brak.
   ------------------------------------------------------------------ */
function sitemap(): Plugin {
  const staticPaths = [
    '/',
    '/oferta',
    '/systemy',
    '/realizacje',
    '/o-nas',
    '/kontakt',
    '/polityka-prywatnosci',
    '/cookies',
  ]

  return {
    name: 'dwa-sitemap',
    apply: 'build',
    generateBundle() {
      const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '')
      const base = (env.VITE_SITE_URL ?? '').replace(/\/+$/, '')

      if (!base) {
        this.warn(
          'VITE_SITE_URL nie jest ustawione — pomijam sitemap.xml. ' +
            'Ustaw adres produkcyjny (np. VITE_SITE_URL=https://przyklad.pl), żeby mapa strony powstała.'
        )
        return
      }

      const paths = [
        ...staticPaths,
        ...categories.map((c) => `/systemy/kategoria/${c.slug}`),
        ...manufacturers.map((m) => `/systemy/producent/${m.slug}`),
        ...systems.filter((s) => s.dataStatus.name === 'confirmed').map((s) => `/systemy/${s.slug}`),
        ...realizations.filter((r) => r.verified).map((r) => `/realizacje/${r.slug}`),
      ]

      const lastmod = new Date().toISOString().slice(0, 10)
      const body = paths
        .map((path) => `  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
        .join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sitemap(), heroPreload()],

  /* ------------------------------------------------------------------
     PODZIAŁ BUNDLA

     Bez tego cały kod bibliotek leżał w jednym pliku startowym: React,
     framer-motion, GSAP, Lenis i ikony razem. Każda poprawka w treści
     unieważniała wtedy cache całości.

     Podział idzie wzdłuż tego, jak często zmienia się dana warstwa i kiedy
     jest potrzebna. `three` zostaje osobno i NIE wchodzi do startu — sięgają
     po niego wyłącznie sekcje ładowane leniwie.
     ------------------------------------------------------------------ */
  build: {
    rollupOptions: {
      output: {
        /* Znak autorstwa w każdym pliku JS. Komentarz w kodzie źródłowym
           wycina minifikator – baner doklejany po minifikacji zostaje. */
        postBanner: '/*! Alukoncept – projekt i realizacja: Gracjan Kubala. © 2026 Gracjan Kubala. Wszelkie prawa zastrzeżone. */',
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          /* Wyliczamy WYŁĄCZNIE biblioteki startowe. Reszta (three, drei
             i ich zależności) zostaje przy automatycznym podziale — inaczej
             wspólny worek „vendor" wciągałby scenę 3D do pierwszego ekranu. */
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils'))
            return 'vendor-motion'
          /* GSAP i Lenis w OSOBNYCH plikach. Razem GSAP jechał na starcie
             na plecach Lenisa, który uruchamia się od razu — a sam jest
             potrzebny dopiero kilka ekranów niżej. */
          if (id.includes('gsap')) return 'vendor-gsap'
          if (id.includes('lenis')) return 'vendor-lenis'
          if (id.includes('react-router') || id.includes('/remix-run/')) return 'vendor-router'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return undefined
        },
      },
    },
  },

  // Port ze zmiennej srodowiskowej, gdy jest ustawiony - pozwala uruchomic
  // kilka instancji dev servera obok siebie. Domyslnie 5173 jak dotad.
  server: { port: Number(process.env.PORT) || 5173 },
})
