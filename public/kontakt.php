<?php
/**
 * Odbiorca zapytań z formularza kontaktowego.
 *
 * Formularz na stronie wysyła tu JSON-a (patrz `handleSubmit`
 * w src/pages/Kontakt.tsx). Skrypt sprawdza dane, składa wiadomość
 * i wysyła ją na skrzynkę firmy funkcją `mail()` hostingu.
 *
 * ADRES ODBIORCY NIE SIEDZI W TYM PLIKU — leży w `kontakt.local.php`
 * obok, który nie trafia do repozytorium i którego nie nadpisuje
 * wgranie nowej wersji strony. Dzięki temu adres firmy nie krąży
 * po GitHubie i przeżywa każdą aktualizację.
 *
 * Gdyby hosting miał wyłączone `mail()` (część firm wymaga SMTP),
 * skrypt zwróci błąd 500 i formularz pokaże komunikat o nieudanej
 * wysyłce — zamiast udawać, że zapytanie poszło.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/** Odpowiedź i koniec. Nigdy nie odsyłamy z powrotem treści od użytkownika.
 *
 * Typ zwrotu `void`, nie `never` — `never` wymaga PHP 8.1, a na hostingu
 * współdzielonym wciąż trafia się 7.4 i plik nawet by się nie sparsował. */
function odpowiedz(int $kod, bool $ok, string $powod = ''): void
{
    http_response_code($kod);
    echo json_encode(['ok' => $ok, 'powod' => $powod], JSON_UNESCAPED_UNICODE);
    exit;
}

/* Tylko POST. Wejście przeglądarką pod ten adres nie ma nic zwracać. */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    odpowiedz(405, false, 'tylko POST');
}

/* Adres odbiorcy z pliku lokalnego. Bez niego nie ma gdzie wysłać —
   lepiej głośny błąd niż ciche gubienie zapytań. */
$konfiguracja = __DIR__ . '/kontakt.local.php';
if (is_readable($konfiguracja)) {
    require $konfiguracja;
}
if (!defined('ODBIORCA') || !filter_var(ODBIORCA, FILTER_VALIDATE_EMAIL)) {
    error_log('kontakt.php: brak poprawnego ODBIORCA w kontakt.local.php');
    odpowiedz(500, false, 'brak konfiguracji odbiorcy');
}

$surowe = file_get_contents('php://input');
if ($surowe === false || strlen($surowe) > 20000) {
    odpowiedz(413, false, 'zapytanie za duze');
}

$dane = json_decode($surowe, true);
if (!is_array($dane)) {
    odpowiedz(400, false, 'nieczytelne dane');
}

/** Pole z formularza: tekst, bez znaków sterujących, przycięty. */
function pole(array $dane, string $klucz, int $maks): string
{
    $wartosc = isset($dane[$klucz]) && is_scalar($dane[$klucz]) ? (string) $dane[$klucz] : '';
    $wartosc = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $wartosc) ?? '';
    $wartosc = trim($wartosc);
    // mbstring bywa wyłączony na tańszych pakietach — wtedy tniemy po bajtach.
    return function_exists('mb_substr')
        ? mb_substr($wartosc, 0, $maks)
        : substr($wartosc, 0, $maks * 2);
}

/* Pułapka na boty. Strona odsiewa je już w przeglądarce, ale automat
   potrafi uderzyć prosto tutaj, z pominięciem JavaScriptu. Udajemy
   powodzenie — żeby nie podpowiadać botowi, że zgłoszenie odrzucono. */
if (pole($dane, 'firma', 200) !== '') {
    odpowiedz(200, true);
}

$imie = pole($dane, 'name', 120);
$telefon = pole($dane, 'phone', 40);
$email = pole($dane, 'email', 160);
$temat = pole($dane, 'topic', 80);
$system = pole($dane, 'system', 80);
$wiadomosc = pole($dane, 'message', 5000);

if ($imie === '' || $wiadomosc === '') {
    odpowiedz(422, false, 'brak imienia albo tresci');
}
/* Formularz wymaga telefonu; e-mail jest opcjonalny. Musi zostać
   przynajmniej jedna droga odpowiedzi. */
if ($telefon === '' && $email === '') {
    odpowiedz(422, false, 'brak kontaktu zwrotnego');
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    odpowiedz(422, false, 'niepoprawny adres e-mail');
}

/* Prosty hamulec: z jednego adresu IP najwyżej kilka zapytań na godzinę.
   Licznik w katalogu tymczasowym — znika przy restarcie i nie wymaga
   bazy ani uprawnień do zapisu w katalogu strony. */
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'brak');
$slad = sys_get_temp_dir() . '/kontakt-' . sha1($ip) . '.txt';
$okno = 3600;
$limit = 5;
$czasy = is_readable($slad)
    ? array_filter(array_map('intval', explode(',', (string) file_get_contents($slad))))
    : [];
$czasy = array_filter($czasy, static fn(int $t): bool => $t > time() - $okno);
if (count($czasy) >= $limit) {
    odpowiedz(429, false, 'zbyt wiele zapytan');
}
$czasy[] = time();
@file_put_contents($slad, implode(',', $czasy), LOCK_EX);

/** Usuwa łamanie linii — bez tego da się dopisać własne nagłówki wiadomości. */
function bezpieczny_naglowek(string $tekst): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $tekst));
}

/** Nagłówek z polskimi znakami musi iść zakodowany, inaczej się rozsypie. */
function zakoduj(string $tekst): string
{
    return '=?UTF-8?B?' . base64_encode(bezpieczny_naglowek($tekst)) . '?=';
}

/* Nadawcą jest adres we własnej domenie — wiadomość „od Gmaila klienta"
   nie przejdzie SPF u większości dostawców i wyląduje w spamie.
   Odpowiedź ma iść do osoby, która wypełniła formularz, więc jej adres
   wchodzi w Reply-To. */
$domena = bezpieczny_naglowek((string) ($_SERVER['HTTP_HOST'] ?? ''));
$domena = preg_replace('/:\d+$/', '', $domena) ?? $domena;   // host bywa z portem
$domena = preg_replace('/^www\./', '', $domena) ?? $domena;

if (defined('NADAWCA') && filter_var(NADAWCA, FILTER_VALIDATE_EMAIL)) {
    $nadawca = NADAWCA;
} else {
    $kandydat = 'formularz@' . $domena;
    // HTTP_HOST podaje klient, wiec moze byc czymkolwiek. Gdy nie sklada sie
    // z tego poprawny adres, nadawca zostaje skrzynka odbiorcy — wiadomosc
    // dojdzie, zamiast odbic sie o bledny naglowek.
    $nadawca = filter_var($kandydat, FILTER_VALIDATE_EMAIL) ? $kandydat : ODBIORCA;
}

$naglowki = [
    'From: ' . zakoduj('Formularz strony') . ' <' . $nadawca . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
if ($email !== '') {
    $naglowki[] = 'Reply-To: ' . zakoduj($imie) . ' <' . bezpieczny_naglowek($email) . '>';
}

$tytul = zakoduj('Zapytanie ze strony' . ($system !== '' ? ' — system ' . $system : ''));

$tresc = "Nowe zapytanie z formularza na stronie.\n\n"
    . "Imię i nazwisko: {$imie}\n"
    . "Telefon: " . ($telefon !== '' ? $telefon : '—') . "\n"
    . "E-mail: " . ($email !== '' ? $email : '—') . "\n"
    . "Czego dotyczy: " . ($temat !== '' ? $temat : '—') . "\n"
    . "System: " . ($system !== '' ? $system : '—') . "\n\n"
    . "Wiadomość:\n{$wiadomosc}\n\n"
    . "---\n"
    . "Wysłano: " . date('Y-m-d H:i:s') . "\n";

/* Piąty argument ustawia kopertowego nadawcę (Return-Path). Bez tego część
   hostingów wysyła jako użytkownik systemowy i wiadomość trafia do spamu. */
$wyslano = @mail(ODBIORCA, $tytul, $tresc, implode("\r\n", $naglowki), '-f' . $nadawca);

if (!$wyslano) {
    error_log('kontakt.php: mail() zwrocilo false — sprawdz, czy hosting pozwala na wysylke');
    odpowiedz(500, false, 'wysylka nieudana');
}

odpowiedz(200, true);
