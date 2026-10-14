/* ------------------------------------------------------------------
   AKTUALIZACJA PLIKÓW PANELU (Decap CMS) — `npm run cms:update`

   Panel w /admin to gotowa, zbudowana paczka Decap CMS i widżet
   logowania Netlify Identity, trzymane w public/admin/vendor.

   Dlaczego nie zwykła zależność w package.json: `decap-cms` ciągnie
   ponad 600 pakietów (loadery webpacka, stare uuid itd.) i 36 ostrzeżeń
   `npm audit` — wszystko po to, żeby skopiować jeden zbudowany plik.
   Dlaczego nie CDN (unpkg): panel z obcego serwera to obcy kod z dostępem
   do repozytorium firmy, a wersja z `@3` zmieniałaby się bez naszej wiedzy.

   Skrypt pobiera wskazane wersje z rejestru npm (`npm pack`) i podmienia
   pliki. Po aktualizacji: sprawdzić panel lokalnie (PANEL.md) i zrobić commit.
   ------------------------------------------------------------------ */
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const DECAP_VERSION = "3.17.0";
const IDENTITY_VERSION = "2.0.3";

const root = resolve(import.meta.dirname, "..");
const vendor = join(root, "public", "admin", "vendor");
const work = mkdtempSync(join(tmpdir(), "vendor-cms-"));

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(" ")} – kod ${result.status}`);
  return result.stdout.trim();
}

/** Rozpakowuje paczkę z rejestru npm i zwraca ścieżkę do jej katalogu. */
function unpack(spec, name) {
  const dir = join(work, name);
  mkdirSync(dir);
  const tarball = run("npm", ["pack", spec, "--silent"], dir).split("\n").pop();
  run("tar", ["-xzf", tarball], dir);
  return join(dir, "package");
}

try {
  rmSync(vendor, { recursive: true, force: true });
  mkdirSync(join(vendor, "decap-cms"), { recursive: true });

  /* Plik główny i fragmenty dociągane na żądanie (`123.decap-cms.js`) —
     bez map źródeł (~60 MB) i bez drugiego wejścia `cms.js`, które jest
     kopią tego samego. Fragmenty muszą leżeć obok pliku głównego: webpack
     szuka ich względem adresu, z którego wczytano skrypt. */
  const decap = unpack(`decap-cms@${DECAP_VERSION}`, "decap");
  for (const file of readdirSync(join(decap, "dist"))) {
    if (/(^|\.)decap-cms\.js$/.test(file) || file === "decap-cms.js.LICENSE.txt") {
      cpSync(join(decap, "dist", file), join(vendor, "decap-cms", file));
    }
  }

  const identity = unpack(`netlify-identity-widget@${IDENTITY_VERSION}`, "identity");
  cpSync(join(identity, "build", "netlify-identity-widget.js"), join(vendor, "netlify-identity-widget.js"));

  console.log(`Panel: decap-cms ${DECAP_VERSION}, netlify-identity-widget ${IDENTITY_VERSION} → public/admin/vendor`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
