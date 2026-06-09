# stingmen.github.io

Statische One-Page Website fuer die Band Stingmen (GitHub Pages ready).

## Projektstruktur

- `index.html` - Aufbau der Seite und alle Sektionen
- `styles.css` - Designsystem, Layout, responsive Verhalten, Animationen
- `app.js` - Navigation, Scroll-Effekte und Laden der Markdown-Inhalte
- `content/news.md` - News & Stories
- `content/tour.md` - Tourdaten (kommend/vergangen)
- `Stingmen_Banner.jpg` - Hero-/Bannerbild

## Lokale Vorschau

Die Seite funktioniert am besten ueber einen lokalen Webserver (nicht via `file://`).

Beispiel mit VS Code Live Server oder alternativ via Terminal:

```powershell
python -m http.server 8080
```

Dann im Browser oeffnen:

`http://localhost:8080`

## Inhalte pflegen

### News (`content/news.md`)

Format je Eintrag:

```md
title: Titel des Beitrags
date: YYYY-MM-DD
link: https://optionaler-link.de
Hier steht der Text der News.
---
```

Hinweise:

- `link` ist optional.
- Eintraege werden automatisch nach Datum sortiert (neueste zuerst).

### Tour (`content/tour.md`)

Format je Eintrag:

```md
title: Name des Auftritts
date: YYYY-MM-DD
location: Stadt oder Venue
status: upcoming
Kurzbeschreibung zum Termin.
---
```

Hinweise:

- `status` ist `upcoming` oder `past`.
- `upcoming` erscheint in "Kommende Shows", `past` in "Vergangene Shows".

## Rechtliches

Die Sektionen Impressum und Datenschutz sind aktuell als Platzhalter vorhanden und sollten vor Produktivbetrieb final mit echten Angaben befuellt werden.
