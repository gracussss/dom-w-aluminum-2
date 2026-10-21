# Przeniesienie strony na hosting klienta (poza Netlify)

Stan: 20.10.2026. Klient planuje własny hosting zamiast Netlify.
Panel `/admin`: wariant A — logowanie kontem GitHub (sekcja 4).

**Ustalone 20.10.2026:**

- **Formularz** ma wysyłać zapytania **na skrzynkę firmy**, skryptem na
  hostingu klienta — nie przez usługę zewnętrzną (Formspree i podobne
  odpadają). Podpinamy dopiero po zatwierdzeniu przez klientkę; do tego
  czasu formularz zostaje w trybie demonstracyjnym, który mówi o tym wprost.
- **Zdjęcia, opisy i pozostałe treści** uzupełnia klientka z panelu. Po
  naszej stronie jest tylko to, żeby panel i strona działały na nowym
  hostingu.
- **Kolejny krok** czeka na jedną informację: **jaki to hosting**. Od tego
  zależy i formularz (PHP kontra funkcja serverless), i sposób logowania
  do panelu. Lista pytań — sekcja 3.

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

### Co trzeba sprawdzić w panelu hostingu przed przygotowaniem plików

Pięć pytań, od których zależy, co dokładnie przygotowujemy. Odpowiedzi widać
w panelu hostingu albo u jego obsługi:

| Pytanie | Dlaczego to zmienia pracę |
|---|---|
| Apache/LiteSpeed z obsługą `.htaccess`, czy coś innego (nginx, hosting statyczny)? | bez `.htaccess` przepisanie adresów i nagłówki trzeba zrobić inaczej; wejście prosto na `/oferta` da inaczej 404 |
| Jest PHP? Która wersja? | formularz ma iść na skrzynkę skryptem na hostingu; bez PHP trzeba funkcji serverless, a to inny hosting albo dodatkowa usługa |
| Czy skrzynka e-mail jest na tym samym hostingu? | jeśli tak, wysyłka idzie lokalnie i prawie nie trafia do spamu; jeśli nie, potrzebne dane SMTP i wpisy SPF/DKIM w domenie |
| FTP, czy SFTP? Dane dostępowe. | decyduje, czy da się ustawić automatyczne wgrywanie po zmianie treści |
| Czy certyfikat SSL jest włączony dla domeny i `www`? | strona wymusza HTTPS (HSTS); bez certyfikatu nie wolno tego włączyć |

Dopóki nie znamy odpowiedzi, przygotowanie `.htaccess` i skryptu formularza
byłoby zgadywaniem — pliki dla Apache są bezużyteczne na hostingu statycznym
i odwrotnie.

---

## 4. Panel `/admin` poza Netlify

**Rozstrzygnięte 21.10.2026: strona idzie na hosting klienta.** Wariant
z pozostawieniem jej na Netlify (dawne „C") odpada — klient chce pliki
u siebie. Zostaje **wariant A: logowanie kontem GitHub + automat budujący**.

Bez Netlify znikają: logowanie (Netlify Identity), zapis z panelu (Git
Gateway), automatyczny build po zapisie i podglądy wersji roboczych.
Podgląd na żywo obok formularza zostaje — działa w samym panelu.

Dlaczego w ogóle potrzebny jest automat: treści są **wkompilowane w stronę
przy budowaniu** (`import.meta.glob` z `eager: true` w `src/data/*.ts`), nie
czytane z bazy w locie. Każdy zapis w panelu wymaga więc przebudowania
strony. Zwykły hosting tego nie robi — musi to zrobić coś na zewnątrz.

Jak to działa po uruchomieniu:

1. Klientka loguje się na `https://domena-klienta.pl/admin` kontem GitHub.
2. Zapis w panelu → commit do repozytorium.
3. GitHub Actions buduje stronę i wgrywa ją na hosting przez FTP/SFTP.
4. Po 2–3 minutach zmiana jest na stronie.

Potrzebne do uruchomienia:

- **dane FTP/SFTP** do hostingu — jako sekrety repozytorium (GitHub →
  Settings → Secrets), nigdy w kodzie ani w rozmowie,
- **darmowe konto GitHub dla klientki**, dodane do repozytorium,
- **skrypt OAuth** obsługujący logowanie — stanie na hostingu klienta (PHP),
  żeby nie dokładać kolejnego zewnętrznego dostawcy.

Wariant zapasowy, gdyby klient nie dał dostępu FTP: zapis w panelu nadal
tworzy commit, ale stronę budujemy i wysyłamy ręcznie nowym archiwum.
Klientka traci wtedy samodzielność — każda zmiana zdjęcia wraca do nas.

Wariant **B** (usługa logowania e-mailem, np. DecapBridge) zostaje w odwodzie
na wypadek, gdyby konto GitHub okazało się dla klientki barierą nie do
przejścia. Kosztem jest kolejny zewnętrzny dostawca.

**Ta decyzja nie może czekać do końca.** Zdjęcia i opisy wprowadza klientka
z panelu — bez działającego `/admin` nie ma czym uzupełnić strony, a to
jest teraz główna rzecz, której brakuje do publikacji. Wcześniejszy zapis
„do czasu decyzji można nie wgrywać panelu" był prawdziwy, dopóki treści
miały iść z naszej strony.

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
