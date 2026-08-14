# web

Reusable website templates for local-business clients, plus a small build script
that turns a client's content into a finished, self-contained HTML site.

## How it's organized

```
templates/<template-name>/template.html   the page markup, styling, and behavior
clients/<client>.json                     one client's content and brand colors
scripts/build.js                          combines a template + a client file into a site
dist/                                     build output (generated, not hand-edited)
```

Four templates exist today, one per vertical:

| Template | Best for | Preview |
|---|---|---|
| `ember-oak` | Restaurants, cafes, bars | menu, story, reviews, reservations |
| `ironclad` | Home services (plumbing, electrical, HVAC, landscaping) | services, trust badges, emergency call CTA |
| `willow-bloom` | Salons, spas, wellness studios | services & pricing, gallery, stylist bios, booking |
| `meridian` | Medical & wellness offices (chiropractors, dentists, therapists) | services, new-patient process, provider bios, insurance & booking |

Each template ships with an example config (`clients/<template-name>.example.json`)
reproducing the original demo content, so you can see exactly what every field does.

## Spinning up a new client site

1. Copy the example config for the template that fits the business:
   ```
   cp clients/ember-oak.example.json clients/marios-pizzeria.json
   ```
2. Edit `clients/marios-pizzeria.json` — swap in the real business name, phone,
   address, hours, menu/services, reviews, and the `theme` colors (a hex per
   accent role; see each config for what's tunable).
3. Build it:
   ```
   node scripts/build.js templates/ember-oak/template.html clients/marios-pizzeria.json dist/marios-pizzeria.html
   ```
4. Open `dist/marios-pizzeria.html` in a browser to check it, then deploy that
   one file wherever the client's site will live (Netlify, Vercel, plain static
   hosting — it has no build dependencies and no external requests).

No Node dependencies are required beyond Node itself (`scripts/build.js` uses
only built-in modules).

## Config file shape

Every config is a plain JSON file. Values are inserted as **plain text**
(safe against accidental HTML) except:

- Fields ending in the template's own `_html` convention (e.g. `hero.headline_html`,
  `business.wordmark_html`) — these intentionally allow a bit of inline markup,
  like an italic accent word or a `<br>`, and are inserted raw.
- `icon_svg` fields in the `ironclad` and `meridian` templates — raw SVG path
  data for each service icon.

Repeated content (menu categories, services, reviews, team members, etc.) is a
JSON array under a key the template loops over — add or remove entries freely,
the layout adapts.

`theme` holds each template's accent colors as hex values; the neutral base
(parchment/near-black for `ember-oak`, navy for `ironclad`, sage/cream for
`willow-bloom`, cool off-white for `meridian`) is part of that template's
identity and isn't meant to be swapped — pick the template that already
matches the client's tone, then tune the accent.

## Adding a new template (new vertical)

Build the one-off HTML page first (get the design right with real content),
then extract it into `templates/<name>/template.html` by replacing the
business-specific text with `{{tokens}}`, moving repeated blocks into
`{{#section}}...{{/section}}` loops, and pulling the CSS color literals for
accents into `{{theme.*}}` tokens. Save the original content as
`clients/<name>.example.json` and rebuild it with `scripts/build.js` to confirm
the output matches before treating the template as done.
