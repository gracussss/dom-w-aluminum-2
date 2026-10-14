# Przeniesienie strony na hosting klienta (poza Netlify)

Stan: październik 2026. Klient planuje własny hosting zamiast Netlify.
Decyzja w sprawie panelu `/admin` jest jeszcze otwarta (sekcja 4).

---

## 1. Co się przenosi

Strona to pliki statyczne: `npm run build` tworzy folder **`dist/`**
(HTML, skrypty, style, czcionki, zdjęcia). Całą zawartość `dist/` wgrywa się
na serwer, zwykle do katalogu `public_html`, przez FTP/SFTP (np. FileZilla).
Nie ma bazy danych ani kodu serwerowego.

Sama strona działa tak samo jak na Netlify: wygląd, animacje, model 3D,
katalog systemów, podstrony.

Build z docelową domeną (canonical, dane strukturalne, `sitemap.xml`):

```bash
VITE_SITE_URL=https://domena-klienta.pl npm run build
```

---

## 2. Co trzeba zrobić inaczej niż na Netlify

| Dziś na Netlify | Na hostingu klienta |
|---|---|
| `public/_redirects`: każdy adres → `index.html` | `.htaccess`: bez tego wejście prosto na `/oferta` albo odświeżenie podstrony daje 404 |
| `public/_headers`: zabezpieczenia, cache, blokada `X-Robots-Tag` | te same reguły w `.htaccess` (`mod_headers`) |
| HTTPS automatycznie | darmowy certyfikat (Let's Encrypt) włączany w panelu hostingu |
| automatyczny build po każdym commicie | ręcznie: build + wgranie `dist/`, albo automat: GitHub Actions → FTP/SFTP |
| Image CDN (`/.netlify/images`) skaluje zdjęcia z panelu | skalowanie przy buildzie; bez tego zdjęcie z telefonu idzie w pełnym rozmiarze |
| formularz: brak odbiorcy (tryb demonstracyjny) | prosty skrypt PHP wysyłający zapytanie na e-mail firmy |
| panel `/admin` (Identity + Git Gateway) | nie działa — patrz sekcja 4 |

Pliki `_headers` i `_redirects` na innym serwerze są ignorowane — nie
szkodzą, ale nic nie robią.

Kod nie wymaga zmian poza tym: `responsiveSrcSet` sam wyłącza warianty
z Netlify Image CDN, gdy build nie idzie na Netlify (`NETLIFY` nieustawione).

---

## 3. Czego potrzeba od klienta

- **Firma hostingowa i pakiet.** Większość polskich hostingów (home.pl,
  nazwa.pl, cyber_Folks, LH.pl) to Apache/LiteSpeed z `.htaccess` i PHP —
  do potwierdzenia przed przygotowaniem plików.
- **Dostęp FTP/SFTP** (host, login, hasło). Przy automacie wpisywany jako
  sekrety repozytorium (GitHub → Settings → Secrets), nigdy w kodzie ani
  w czacie.
- **Domena** skierowana na hosting i **włączony SSL**.
- **Adres e-mail** odbiorcy zapytań z formularza.
- **Decyzja w sprawie panelu** (sekcja 4).

---

## 4. Panel `/admin` poza Netlify (decyzja otwarta)

Bez Netlify znikają: logowanie (Netlify Identity), zapis z panelu (Git
Gateway), automatyczny build po zapisie i podglądy wersji roboczych.
Podgląd na żywo obok formularza zostaje — działa w samym panelu.

Warianty:

- **A — logowanie kontem GitHub.** Klientka zakłada darmowe konto GitHub
  i dostaje dostęp do repozytorium. Logowanie przez mały skrypt OAuth na
  hostingu klienta (PHP) albo na darmowym Cloudflare Workers. Zapis z panelu
  → commit → GitHub Actions buduje i wgrywa stronę przez FTP/SFTP.
- **B — usługa logowania e-mailem dla Decap CMS** (np. DecapBridge).
  Dla klientki tak jak dziś, ale to kolejny zewnętrzny dostawca — warunki
  do sprawdzenia przed decyzją.
- **C — strona zostaje na Netlify, hosting klienta tylko na pocztę
  i domenę.** Nic do przerabiania: domena kierowana na Netlify, poczta (MX)
  zostaje u klienta.

Do czasu decyzji `/admin` można nie wgrywać na hosting klienta.

Szacunek pracy dla wariantu A/B (automat FTP, `.htaccess`, formularz PHP,
skalowanie zdjęć przy buildzie, logowanie panelu): około jednego dnia.

---

## 5. Kolejność przy przenosinach

1. Klient kupuje hosting i kieruje na niego domenę; włącza SSL.
2. Przygotowanie: `.htaccess`, formularz PHP, build z `VITE_SITE_URL`.
3. Wgranie `dist/` (ręcznie albo automatem).
4. Sprawdzenie: podstrony po odświeżeniu, formularz, https, telefon,
   nagłówki (securityheaders.com).
5. W dniu startu: zdjęcie blokady przed Google — checklista w `SEO.md`,
   sekcja 9 (na hostingu klienta reguła `X-Robots-Tag` siedzi w `.htaccess`,
   nie w `_headers`).
