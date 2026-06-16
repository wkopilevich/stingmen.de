# stingmen.github.io

Statische One-Page Website für die Band Stingmen (GitHub Pages ready).

## Projektstruktur

- `index.html` – Aufbau der Seite und alle Sektionen (Header, 9 Seiten-Sektionen, Footer)
- `styles.css` – Designsystem, Layout, responsive Verhalten, Animationen (Dark Theme mit Gold-Akzenten)
- `app.js` – Navigation, Scroll-Effekte, Laden der Markdown-Inhalte (news.md, tour.md)
- `content/news.md` – News & Stories (Cards oder expandierbare Inhalte)
- `content/tour.md` – Tourdaten (kommend/vergangen)
- `content/Technical-Rider-2-2026.pdf` – Technical Rider für Venues
- `Stingmen_Banner.jpg` – Hero-Bannerbild

## Lokale Vorschau

Die Seite funktioniert am besten über einen lokalen Webserver (nicht via `file://`).

Beispiel mit `http-server` (npm):

```powershell
npx http-server -p 8090 -c-1
```

Browser: `http://localhost:8090`

## Inhalte pflegen

### News & Stories (`content/news.md`)

Format je Eintrag:

```md
title: Titel des Beitrags
date: 2026-06-15
link: https://optionaler-link.de
teaser: Optionaler Kurz-Teaser (wird vor Expandable angezeigt)
expandable: true

Hier steht der Volltext der Story/News. Absätze werden automatisch erkannt.
```

Hinweise:

- `link`: Externe Verlinkung für externe News (öffnet in neuem Tab)
- `expandable: true`: Macht die Story in der Card expandierbar (inline <details> Element)
- `teaser`: Wird als Vorschau angezeigt, Rest wird durch "Mehr" Button expandiert
- Einträge werden automatisch nach Datum sortiert (neueste zuerst)
- Absätze im Body werden durch Leerzeilen getrennt

### Tour (`content/tour.md`)

Format je Eintrag:

```md
title: Name des Auftritts
date: 2026-07-20
location: Duisburg
status: upcoming

Kurzbeschreibung zum Termin / Ankündigung.
```

Hinweise:

- `status`: `upcoming` oder `past`
- `upcoming` → „Kommende Shows", `past` → „Vergangene Shows"
- Einträge werden innerhalb Kategorie nach Datum sortiert

## Features

- **9 Sektionen**: Home, News & Stories, Tour, Media, Bio, Lineup, Tech, Impressum, Datenschutz
- **Responsive Design**: Mobile-first, optimiert ab 860px (Desktop)
- **Expandable Stories**: News mit `expandable: true` rendern als inline-Details-Element mit "Mehr" Button
- **Scroll-Animationen**: Intersection Observer für staggered Section Reveals
- **Linkfarben**: Alle Links (auch E-Mail/Telefon im Impressum) in Brand-Gold (#f4ca67)
- **SVG Icons**: Semantische Icons für jede Section (News, Tour, Media, etc.)
- **Sticky Header**: Navigation bleibt oben sichtbar beim Scrollen

## Technische Details

- **HTML5**: Semantic Markup mit aria-labels
- **CSS3**: Custom Properties für Theme, Grid/Flexbox Layouts, `object-fit: contain` für vollständige Bildarstellung
- **JavaScript (Vanilla)**: CRLF-aware Markdown-Parser, Client-seitige Content-Behandlung
- **GitHub Pages**: Automatisches Publishing via `main` Branch Push

## Rechtliches

- **Impressum**: Michael Rolles Kontaktdaten (Straße, Mail, Telefon)
- **Datenschutz**: 8 expandierbare Accordion-Sektionen (GDPR-relevant)
- Beide Sektionen sind in `index.html` integriert und live
