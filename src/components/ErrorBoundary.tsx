import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { company } from "../data/company";

/**
 * Błąd przy dociąganiu części strony. Typowy po wdrożeniu nowej wersji:
 * karta otwarta przed wdrożeniem prosi o pliki ze starymi nazwami (hash),
 * których na serwerze już nie ma. Wtedy pomaga samo odświeżenie.
 */
function isStaleChunk(error: Error) {
  return /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch/i.test(
    error.message
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** „page” – pod nagłówkiem, w miejscu treści; „full” – cały ekran, gdy padło wszystko. */
  variant?: "page" | "full";
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Zamiast białego ekranu przy błędzie w skrypcie – czytelny komunikat,
 * przycisk odświeżenia i telefon do firmy. Bez tego jeden wyjątek w dowolnym
 * komponencie odmontowywał całą aplikację i zostawała pusta strona.
 *
 * Fallback nie korzysta z routera ani z innych komponentów strony: musi
 * się wyrenderować także wtedy, gdy to one są źródłem błędu.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Bez zewnętrznego serwisu do zbierania błędów – zostaje ślad w konsoli.
    console.error("Błąd strony:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const stale = isStaleChunk(error);
    const full = this.props.variant === "full";

    return (
      <section
        role="alert"
        className={`relative flex flex-col items-center justify-center bg-void px-6 text-center text-limestone ${
          full ? "min-h-[100svh]" : "min-h-[75svh] pb-20 pt-32"
        }`}
      >
        <p className="label text-sm text-bronze-light md:text-base">
          {stale ? "Nowa wersja strony" : "Coś poszło nie tak"}
        </p>
        <h1 className="display display-tight mt-6 max-w-3xl text-[11vw] leading-none sm:text-5xl md:text-6xl">
          {stale ? "Odśwież stronę" : "Nie udało się wczytać strony"}
        </h1>
        <p className="mt-6 max-w-md text-pretty text-lg text-limestone/65">
          {stale
            ? "Strona została w międzyczasie zaktualizowana. Odświeżenie wczyta jej najnowszą wersję."
            : "Spróbuj odświeżyć stronę. Jeśli problem wróci, zadzwoń do nas – chętnie pomożemy."}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-limestone px-7 py-4 label text-void transition-colors hover:bg-bronze-light"
          >
            Odśwież stronę
          </button>
          <a
            href={company.phone.href}
            className="border border-limestone/25 px-7 py-4 label text-limestone transition-colors hover:border-limestone/60"
          >
            Zadzwoń: {company.phone.display}
          </a>
          {/* Zwykły odnośnik, nie <Link>: przy błędzie warto przeładować
              całą aplikację, a nie tylko podmienić widok. */}
          <a
            href="/"
            className="px-7 py-4 label text-limestone/70 underline-offset-8 transition-colors hover:text-limestone hover:underline"
          >
            Strona główna
          </a>
        </div>
      </section>
    );
  }
}
