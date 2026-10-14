import { Marked } from "marked";
import type { Tokens } from "marked";

/* ------------------------------------------------------------------
   TREŚĆ WPISÓW (MARKDOWN Z PANELU) → HTML

   Treść pisze klient w edytorze panelu, bez przeglądu kodu. Dlatego:
   - surowy HTML w treści jest wyświetlany jako tekst, nie wykonywany —
     wklejony z innej strony <iframe> czy <script> nie trafi na stronę,
   - linki tylko http(s), mailto, tel i ścieżki wewnętrzne — `javascript:`
     z wklejonego tekstu nie stanie się klikalnym skryptem,
   - nagłówki zaczynają się od <h2>: <h1> ma już tytuł wpisu, a drugi
     <h1> na stronie myli czytniki ekranu i wyszukiwarkę.
   ------------------------------------------------------------------ */

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const marked = new Marked({ gfm: true, breaks: true });

marked.use({
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
    heading({ tokens, depth }: Tokens.Heading) {
      const level = Math.min(Math.max(depth, 2), 4);
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
    link({ href, title, tokens }: Tokens.Link) {
      const label = this.parser.parseInline(tokens);
      if (!SAFE_URL.test(href)) return label;
      const external = /^https?:\/\//i.test(href);
      const attrs = [
        `href="${escapeHtml(href)}"`,
        title ? `title="${escapeHtml(title)}"` : "",
        external ? 'target="_blank" rel="noopener noreferrer"' : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<a ${attrs}>${label}</a>`;
    },
    image({ href, title, text }: Tokens.Image) {
      if (!SAFE_URL.test(href)) return escapeHtml(text);
      const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : "";
      return `<figure><img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />${caption}</figure>`;
    },
  },
});

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
