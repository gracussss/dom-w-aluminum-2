/* ------------------------------------------------------------------
   ODMIANA RZECZOWNIKÓW PO LICZEBNIKU

   Polski ma trzy formy, nie dwie. Uproszczenie „1 / do 4 / reszta”
   działa do dziesięciu, a potem zaczyna kłamać: przy 23 pozycjach
   dawało „23 pozycji” zamiast „23 pozycje”.

   Reguła: końcówka 2–4 bierze liczbę mnogą, ale nastolatki (12–14)
   są wyjątkiem i wracają do dopełniacza.
   ------------------------------------------------------------------ */

export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;

  const lastDigit = n % 10;
  const lastTwo = n % 100;

  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}

/** „1 pozycja / 2 pozycje / 5 pozycji” */
export function positions(n: number): string {
  return plural(n, "pozycja", "pozycje", "pozycji");
}

/** „1 system / 2 systemy / 5 systemów” */
export function systemsWord(n: number): string {
  return plural(n, "system", "systemy", "systemów");
}
