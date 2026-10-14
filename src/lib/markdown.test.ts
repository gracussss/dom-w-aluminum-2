import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

/* Treść aktualności pisze klient i trafia ona na stronę bez przeglądu
   kodu — te testy pilnują, że wklejony HTML czy link `javascript:` nie
   staną się wykonywalnym kodem. */
describe("treść wpisów z panelu", () => {
  it("surowy HTML wyświetla jako tekst, nie wykonuje", () => {
    const out = renderMarkdown('Tekst <script>alert(1)</script>\n\n<img src=x onerror="alert(1)">');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<img src=x");
    expect(out).toContain("&lt;script&gt;");
  });

  it("link javascript: zostaje samym tekstem", () => {
    const out = renderMarkdown("[kliknij](javascript:alert(1))");
    expect(out).not.toContain("javascript:");
    expect(out).toContain("kliknij");
  });

  it("linki zewnętrzne otwiera w nowej karcie, wewnętrzne i tel: normalnie", () => {
    const out = renderMarkdown("[a](https://aluprof.com) [b](/kontakt) [c](tel:+48695704228)");
    expect(out).toContain('href="https://aluprof.com" target="_blank" rel="noopener noreferrer"');
    expect(out).toContain('<a href="/kontakt">b</a>');
    expect(out).toContain('<a href="tel:+48695704228">c</a>');
  });

  it("nagłówek # schodzi do <h2> — <h1> ma tytuł wpisu", () => {
    expect(renderMarkdown("# Tytuł")).toContain("<h2>Tytuł</h2>");
  });

  it("zdjęcie z podpisem jako <figure>", () => {
    const out = renderMarkdown('![Fasada](/uploads/fasada.jpg "Biurowiec w Katowicach")');
    expect(out).toContain('<img src="/uploads/fasada.jpg" alt="Fasada" loading="lazy"');
    expect(out).toContain("<figcaption>Biurowiec w Katowicach</figcaption>");
  });
});
