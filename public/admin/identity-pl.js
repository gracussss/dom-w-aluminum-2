/* Okienko logowania do panelu po polsku.

   Widżet Netlify Identity ma polskie tłumaczenie, ale domyślnie startuje
   po angielsku, a Decap uruchamia go bez opcji. Inicjalizacja tutaj, z
   `locale: "pl"`, wyprzedza tę z Decapa (widżet uruchamia się tylko raz).

   Plik stoi PO skrypcie Decapa: Decap czeka na zdarzenie `init` widżetu
   i bez niego startował dopiero po 2,5 s. Skrypt w osobnym pliku, nie
   w <script> w HTML-u — CSP panelu nie dopuszcza skryptów inline. */
if (window.netlifyIdentity) {
  window.netlifyIdentity.init({ locale: "pl" });
}
