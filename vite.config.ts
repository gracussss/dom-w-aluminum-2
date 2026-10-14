import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { build, defineConfig, loadEnv, type Plugin } from 'vite'
import { defineSystems } from './src/catalog/systemFactory'
import { categories, manufacturers } from './src/catalog/taxonomy'
import { normalizeRealizations } from './src/data/realizationModel'
import { normalizePosts } from './src/data/newsModel'
import { images } from './src/data/images'
import type { ContentEntry } from './src/lib/content'
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
      // Te same warianty co w <img> (patrz NETLIFY_IMAGES niżej) — inaczej
      // przeglądarka pobrałaby tło dwa razy: z preloadu i z komponentu.
      const srcSet = responsiveSrcSet(images.heroBg, NETLIFY_IMAGES)
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
   CONTENT SECURITY POLICY STRONY

   Polityka stoi w <meta> strony, a nie w nagłówku z public/_headers:
   nagłówek obejmuje każdy adres (`/*`), także panel w /admin, a panel
   potrzebuje 'unsafe-eval' (walidator konfiguracji Decap CMS). Netlify
   nie ma reguły „wszystko poza /admin”, a dwie polityki CSP się nie
   znoszą — przeglądarka egzekwuje obie, więc luźniejsza dla panelu
   w nagłówku nic by nie dała. Panel ma własną w public/admin/index.html.

   Wspólny nagłówek zostawia to, czego meta nie obsługuje albo co pasuje
   wszędzie (frame-ancestors, object-src, base-uri).

   Tylko w buildzie: serwer deweloperski Vite wstrzykuje skrypt odświeżania
   inline i łączy się przez WebSocket — pod tą polityką by nie ruszył.

   CSP wymienia wszystko, z czego strona korzysta poza własną domeną:
     images.unsplash.com  – zdjęcia poglądowe (do usunięcia po wymianie
                            wszystkich na zdjęcia firmy),
     www.google.com       – osadzona mapa, ładowana dopiero po zgodzie.
   'unsafe-inline' w style-src jest konieczne: React i framer-motion
   ustawiają style w atrybutach. Skrypty – wyłącznie z własnej domeny.
   Po ustawieniu VITE_CONTACT_ENDPOINT (zewnętrzny odbiorca formularza)
   trzeba dopisać jego domenę do connect-src.
   Przetestowane w przeglądarce (październik 2026): strona główna ze sceną
   3D, katalog, karta systemu, kontakt z mapą – bez naruszeń CSP.
   ------------------------------------------------------------------ */
const SITE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.google.com',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

function contentSecurityPolicy(): Plugin {
  return {
    name: 'dwa-csp',
    apply: 'build',
    transformIndexHtml() {
      // Na samej górze <head>: polityka obejmuje tylko to, co stoi po niej.
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: SITE_CSP },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

/* ------------------------------------------------------------------
   ZDJĘCIA Z PANELU NA NETLIFY

   Netlify ustawia w buildzie NETLIFY=true. Tylko wtedy istnieje Image CDN
   (`/.netlify/images`), który skaluje zdjęcia wgrane w panelu — patrz
   src/lib/responsiveImage.ts. Lokalnie zostaje oryginalny plik.
   ------------------------------------------------------------------ */
const NETLIFY_IMAGES = process.env.NETLIFY === 'true'

/* ------------------------------------------------------------------
   PODGLĄD NA ŻYWO W PANELU (/admin/preview/)

   Osobna paczka budowana po stronie: src/admin/preview.tsx z tymi samymi
   komponentami i arkuszem stylów, ale do stałych nazw plików
   (preview.js, preview.css) — wskazuje je public/admin/index.html, który
   Vite kopiuje bez przetwarzania i nie zna nazw z hashem.

   Osobny build zamiast drugiego wejścia w tej konfiguracji: wspólne
   pliki obu wejść zmieniłyby podział paczki strony (patrz komentarz przy
   `manualChunks`), a panel ma prawo być ciężki — strona nie.
   ------------------------------------------------------------------ */
function adminPreview(): Plugin {
  return {
    name: 'dwa-admin-preview',
    apply: 'build',
    async closeBundle() {
      await build({
        configFile: false,
        logLevel: 'warn',
        plugins: [react(), tailwindcss()],
        define: { __NETLIFY_IMAGES__: JSON.stringify(NETLIFY_IMAGES) },
        build: {
          outDir: 'dist/admin/preview',
          emptyOutDir: true,
          // /fonts/… w arkuszu wskazują pliki strony — rozwiązywane, nie kopiowane.
          copyPublicDir: false,
          cssCodeSplit: false,
          chunkSizeWarningLimit: 4000,
          rollupOptions: {
            input: 'src/admin/preview.tsx',
            output: {
              /* Zwykły skrypt, nie moduł: wykonuje się od razu po Decapie, zanim
                 ten wczyta konfigurację i narysuje edytor. Moduł (odroczony) bywał
                 za późno — przy wejściu prosto na adres wpisu panel zdążył wybrać
                 domyślny podgląd i już do szablonu nie wracał. */
              format: 'iife',
              entryFileNames: 'preview.js',
              assetFileNames: (asset) =>
                asset.names.some((name) => name.endsWith('.css')) ? 'preview.css' : 'assets/[name]-[hash][extname]',
              // Jeden plik — public/admin/index.html wskazuje go stałą nazwą.
              codeSplitting: false,
            },
          },
        },
      })
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
/* Kolekcje „jeden plik = jeden wpis” czytane z dysku. Strona robi to przez
   import.meta.glob, którego w konfiguracji nie ma — dlatego tu fs, a dalej
   ta sama normalizacja co na stronie (te same adresy, te same filtry). */
function readContentDir(dir: string): ContentEntry[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      slug: file.replace(/\.json$/, ''),
      data: JSON.parse(readFileSync(join(dir, file), 'utf8')) as unknown,
    }))
}

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

      const systems = defineSystems(readContentDir('src/content/systemy'))
      const realizations = normalizeRealizations(readContentDir('src/content/realizacje'))
      const posts = normalizePosts(readContentDir('src/content/aktualnosci'))

      const paths = [
        ...staticPaths,
        ...categories.map((c) => `/systemy/kategoria/${c.slug}`),
        ...manufacturers.map((m) => `/systemy/producent/${m.slug}`),
        ...systems.filter((s) => s.dataStatus.name === 'confirmed').map((s) => `/systemy/${s.slug}`),
        ...realizations.filter((r) => r.verified).map((r) => `/realizacje/${r.slug}`),
        // Lista aktualności dopiero z pierwszym wpisem — pusta ma `noindex`.
        ...(posts.length > 0 ? ['/aktualnosci', ...posts.map((p) => `/aktualnosci/${p.slug}`)] : []),
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
  plugins: [react(), tailwindcss(), sitemap(), heroPreload(), contentSecurityPolicy(), adminPreview()],

  define: {
    __NETLIFY_IMAGES__: JSON.stringify(NETLIFY_IMAGES),
  },

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
