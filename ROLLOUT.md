# Salle de contrôle Blue Lock — rollout guide

How to build or extend a page in the "monitor" direction. The shared layer is
`CSS/theme-monitor.css` (loaded last on every page). All 15 pages and the 11 player
profiles are migrated (`body.nl-migrated`); `index.html`, `players.html` and the profiles
(`Joueurs/player-card.css` + `Joueurs/player-card.js`, built from
`scripts/templates/joueur.html`) are the reference. `CSS/style.css` and
`CSS/legacy-pages.css` are no longer linked by any page.

Concept: Ego Jinpachi's surveillance room. Every page is a wall of screens: camera feeds,
OSD strips, a red REC light, timecodes, giant `#001` ranks, micro katakana.

## 1. Page setup (do this first)

```html
<body class="nebula-page stats-page nl-migrated">
```

- `stats-page` = your page class. **Prefix every selector of your page CSS with it**
  (`body.stats-page .record-card`). Page CSS loads *before* global-theme.css,
  responsive.css and theme-monitor.css, so an unprefixed page rule loses every tie against
  the kit. Do not reorder the `<link>`s.
- `nl-migrated` switches off the legacy safety nets of theme-monitor.css (section 10:
  automatic hero/eyebrow/index styling). Add it only once the page is restyled.
- Need to beat an `!important` from global-theme.css or responsive.css? Put the declaration,
  with `!important`, inside `@layer nl-force { … }` in your page CSS (declare
  `@layer nl-force;` at the top of the file). A layered `!important` beats every unlayered
  one. Never answer `!important` with more selectors or more `!important`.
- global-theme.css forces `main` and `.cards-container` to `min(1440px, 100% - 6vw)`.
  To go edge to edge, use `.nl-bleed` (or `.nl-hero`, already full-bleed). Do not put
  `overflow-x: hidden/clip` on `main`: it cuts full-bleed blocks.
- **Never use `<header>` for anything except `.site-header`.** global-theme.css makes every
  other `<header>` sticky, opaque and paddingless with `!important`. Use `<div>`.
- Header OSD strip, live clock and channel nav are injected by `JavaScript/hamburger.js`:
  nothing to add. Footer: copy the `footer.nl-footer` block from players.html
  (its "Retour en haut" link needs `id="top"` on `.site-header`).

## 2. Tokens (`:root` in theme-monitor.css)

| Token | Value | Use |
|---|---|---|
| `--ink` | #020611 | page background, text on white/blue chips |
| `--screen` / `--surface` / `--surface-2` / `--surface-3` | #040c20 / #061028 / #0a1734 / #102247 | screens, panels, raised panels, offline caption |
| `--bezel` | #01040c | seams between screens, frame around monitors |
| `--blue` | #1f5bff | dominant accent: bands, active states, captions |
| `--blue-2` | #3d7bff | signal blue (replaces the old lime): links, highlights, `em` in titles |
| `--blue-3` | #8db0ff | light blue (replaces cyan): OSD text, labels, codes |
| `--blue-deep` / `--blue-soft` / `--blue-glow` | #0b2a8f / 16% / 50% | gradient ends, tinted fills, glows |
| `--paper` / `--white` | #f3f7ff / #fff | body text / emphasis |
| `--muted` / `--dim` | #8b9ac0 / #5f6e96 | secondary text / tertiary text, katakana |
| `--rec` / `--rec-soft` | #ff2b40 / 14% | **only** REC, DIRECT, alerts, "signal lost" |
| `--offline` | #7d8bb3 | retired players, archived, offline feeds (replaces purple) |
| `--line` / `--line-soft` / `--line-strong` | blue at 20% / 10% / 42% | borders, dividers |
| `--display` / `--sans` / `--mono` / `--jp` | Chakra Petch / IBM Plex Sans / IBM Plex Mono / Noto Sans JP | |
| `--scanlines`, `--scanlines-strong`, `--glare`, `--noise`, `--fringe`, `--mire`, `--mire-low` | textures | |

Club colours (`[data-club]`, `--club`) stay as thin identity accents (a 3-4px bar, a dot,
a caption tint), never as a panel background.

## 3. Type scale and minimums

| Token | Size | Use |
|---|---|---|
| `--fs-micro` | 11px | OSD, camera labels, timecodes, codes (tracking `--track-micro` .08em) |
| `--fs-label` | 12px | field labels, tabs, chips (tracking `--track-label` .06em) |
| `--fs-data` | 14px | table values, readouts |
| `--fs-body` / `--fs-lead` | 16px / 16-18px | body / hero lead |
| `--fs-d4` | 1.3-1.9rem | panel title |
| `--fs-d3` | 2.1-5rem | section title |
| `--fs-d2` | 2.6-8.6rem | page title (hero) |
| `--fs-d1` | 3.3-12.5rem | master screen only (home) |
| `--fs-rank` | 3.4-7.4rem | `#001` |

- **Nothing visible under 11px**, pseudo-elements included. Write `max(11px, 0.4em)` when a
  size is relative. Over 0.1em tracking on 11px mono is too wide: use .04-.08em.
- Display type is Chakra Petch 700, uppercase, tight (`-0.02em`, line-height .84).
  Italic is reserved for numbers (ranks, OVR, counters) and one accent word per page.
- Big titles never break mid-word: no `overflow-wrap: anywhere` on h1/h2, size them with a
  clamp whose minimum fits the longest word at 390px.

## 4. Spacing and shape

`--sp-1…9` = 4, 8, 12, 16, 24, 32, 48, 72, 112px. `--gutter` = clamp(16px, 3vw, 48px),
`--page` = min(1440px, 100% - 2 gutters), `--seam` = 3px (joint between screens of a wall).
Radii: `--r-mon` 6px (monitors), `--r-ctl` 3px (controls), 0-2px for chips and feeds.
`--cut` 12px = clipped corner of `.nl-btn`. Sections breathe: 72-112px between bands.

## 5. Component kit (all classes start with `nl-`)

The legacy nets of global-theme.css skip `nl-*` classes, so the kit styles cleanly.

**Hero** — every page hero uses one monitor motif. Pick one variant:

```html
<section class="nl-hero nl-hero--master">            <!-- or --wall, --mire, --band -->
  <div class="osd"><span><b>CAM 07</b> // ZONE C</span><span class="rec">REC</span></div>
  <div class="nl-hero-feed" aria-hidden="true"><img src="…" alt=""></div>   <!-- master only -->
  <span class="nl-reticle" aria-hidden="true"><i></i><span>CIBLE VERROUILLÉE</span></span>
  <div class="nl-hero-inner">
    <p class="nl-kicker"><span class="nl-ch">CH 07</span> Records // Saison 01</p>
    <h1 class="nl-headline">Les <em>records</em></h1>   <!-- + nl-headline--xl / --italic -->
    <p class="nl-lead">… <b>mot clé</b> …</p>
    <div class="nl-hero-actions"><a class="nl-btn" href="…">Voir <span>↗</span></a>
      <a class="nl-btn nl-btn-ghost" href="…">Règles</a></div>
  </div>
</section>
```

`--wall`: put `<div class="nl-hero-wall">` + `.nl-feed` tiles (no text) behind the inner
block. `--mire`: test-card bars, for empty or off-season pages. `--band`: solid blue.
`.nl-timecode` = small mono readout. OSD spans can drop out on small screens:
`osd-hide-md` (<= 1180px), `osd-hide-sm` (<= 680px), `osd-hide-xs` (<= 420px); they work in
`.osd` and `.nl-feed-osd`. Hero OSD order on every page: `span.rec` "REC", `CAM nn // NOM`,
one info span, a `.jp` katakana span, one info span.
A page that puts `.nl-hero-wall` back in the flow sets `--hero-wall-top: 0`; a busy
`--master` image can be dimmed on phones with `--hero-feed-opacity` (default .55).
`.nl-hero-inner` is a flex column with `justify-content: flex-end`: if a page turns it into
a grid, reset `justify-content` too.

**Section head** (on a `div`; `--band` turns the row into a full-width blue band):

```html
<div class="nl-section-head">
  <div class="nl-chno"><small>CH</small><b>02</b></div>
  <div><p class="nl-kicker">Données cumulées</p><h2 class="nl-section-title">Les <em>buteurs</em></h2></div>
  <p class="nl-section-note">Une phrase de contexte.</p>
</div>
```

**Camera feed + wall** (`a.nl-feed` gets hover zoom + lock frame; `.is-locked` = permanent
frame; `.is-offline` = dead feed):

```html
<div class="nl-wall">                       <!-- --wall-cols (4), --wall-cols-sm (2, <=680px) -->
  <a class="nl-feed is-locked" href="…">
    <img class="nl-feed-img" src="…" alt="">
    <span class="nl-feed-lock" aria-hidden="true"></span>
    <span class="nl-feed-osd"><span><b>CAM 01</b> // ZONE A</span><span class="rec">REC</span></span>
    <span class="nl-feed-tc">00:42:17</span>
    <strong class="nl-feed-figure">96</strong>
    <span class="nl-feed-caption"><small>#001 // MANSHINE</small><b>William</b><em>Attaquant</em></span>
  </a>
  <div class="nl-feed is-offline"><span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
    <span class="nl-feed-osd"><span><b>CAM 03</b> // ARCHIVES</span><span class="rec is-off">HORS LIGNE</span></span></div>
</div>
```

`button.nl-feed` (a selectable feed) gets the same hover / focus / lock frame as `a.nl-feed`.
Set `--wall-cols` in page CSS per breakpoint (not inline). Feeds take `--feed-pos`
(object-position) and `--feed-zoom`. Portraits stay `<img>`; keep any inline
`view-transition-name` exactly as the JS writes it.

**Rank / unranked**: `<span class="nl-rank"><small>#</small>001</span>` (+ `nl-rank--md`,
`nl-rank--sm`, `.is-podium` for #002-#003). Retired or unrated players are never numbered:
`<span class="nl-nc"><b>NON CLASSÉ</b><small>ARCHIVÉ // RETRAITE</small></span>`.
Ranking rule everywhere: active (`club !== "retraite"`) players with a numeric
`technical.global`, sorted by it (same code in players.js and player-card.js).

**Key figures**:

```html
<div class="nl-stats">
  <div class="nl-stat nl-stat--solid"><span class="nl-stat-label">Matchs joués</span>
    <strong class="nl-stat-value">24<small>/30</small></strong><span class="nl-stat-note">Saison 01</span></div>
</div>
```

**VU meter**: `<div class="nl-vu-row"><span>Dribble</span><b>95</b><div class="nl-vu" style="--v:95"
role="meter" aria-label="Dribble" aria-valuemin="0" aria-valuemax="100" aria-valuenow="95"></div></div>`
(`nl-vu--max` for 100).

**Channels (tabs)**: `div.nl-channels[role=tablist]` > `button.nl-channel[role=tab]` >
`span.nl-channel-num` "CH 01" + label. Active: `.is-active`, `.active` or
`aria-selected="true"` (shows "EN DIRECT"; add `.nl-channels--quiet` on toggles that are not
a live feed). Stacks vertically under 680px.

**Filter console**:

```html
<section class="nl-console">
  <div class="nl-console-head"><span class="nl-ch">CH 03-B</span><h2>Console de tri</h2><p>Filtrez le registre</p></div>
  <div class="nl-console-body">
    <label class="nl-field"><span class="nl-field-label">Recherche</span><input class="nl-input" type="search"></label>
    <div class="nl-field"><span class="nl-field-label">Compétition</span>
      <div class="nl-keys"><button class="nl-key is-active" type="button" aria-pressed="true">Tous</button>…</div></div>
  </div>
</section>
```

`select.nl-input` and `textarea.nl-input` are styled too.

**Table**: `div.nl-table-wrap > table.nl-table`; `th.is-hl`/`td.is-hl` = highlighted column,
`td.nl-num` (rank), `td.nl-strong` (name), `<tr style="--club:#ff1a1a">` = club bar.
The wrap scrolls horizontally on mobile (table min-width 560px).

**Tags**: `.nl-tag` + `--rec` (DIRECT), `--ligue`, `--ncl`, `--amical`, `--pos`
(`style="--club:…"`), `--club`, `--off`.

**Empty state** (never a blank area or "no data" sentence alone):
`<div class="nl-nosignal"><span class="nl-nosignal-code">SIGNAL 00</span><strong>Aucun résultat</strong><p>…</p></div>`
(`nl-nosignal--compact` for stacked panels).

**Buttons**: `.nl-btn` (solid blue, clipped corner), `.nl-btn-ghost`, `.nl-btn-light`
(on a blue band), `.nl-btn-sm`. Work on `<a>` and `<button>`. Mobile touch targets ≥ 44px.

**Modal**: `div.nl-modal[hidden] > .nl-modal-backdrop + section.nl-modal-panel[role=dialog][aria-modal=true]`
(the backdrop may be a `<button>`, it is reset by the kit)
> `.osd` (title + `button.nl-modal-close`) + `.nl-modal-body`.

**Section head inside a blue band**: a `.nl-section-head` placed in a `.nl-band` takes the
band colours automatically (ink CH block, white rule).

**Channel numbering**: each page keeps the number of its screen on the home wall
(CH 01 Titres, 02 Joueurs, 03 Clubs, 04 Valeurs, 05 Matchs, 06 Records, 07 Règles,
08 Face à face, 09 Saisons, 10 Calendrier, 11 Progression, 12 Équipes idéales, 00 accueil
et régie) in its kicker and hero OSD (`CH 06`, `CAM 06 // …`).

**Primitives**: `.osd` (+ `.osd--solid`), `.rec` / `.rec.is-off`, `.nl-off`, `.jp`, `.fringe`,
`.nl-wrap`, `.nl-bleed`, `.mon` + `.mon-body` (framed monitor), `.nl-aim` (corner brackets),
`.nl-noise`, `.nl-band` (solid blue full-width band), `.nl-sr` (screen-reader only).

## 6. Do / don't

Do
- Lead every page with an image or a giant figure: a feed, a wall, a lineup, a `#001`.
  Text-only heroes are the old site.
- Use solid blue bands and full-bleed feeds to break the rhythm (at least one per page).
- Label screens like cameras: `CAM 04 // ZONE B`, `CH 02`, timecodes, `SIGNAL STABLE`.
- Show retired / archived data in `--offline` grey with `HORS LIGNE` / `ARCHIVÉ`.
- Turn every empty list into a test card (`.nl-nosignal`, `.nl-feed-mire`).
- Keep French copy, including OSD text (`HORS LIGNE`, not `OFFLINE`).

Don't
- No purple, no lime (#adff2f), no cyan (#63e7ff / #00ffff): use `--blue-2` / `--blue-3` / `--offline`.
- No red except REC dots, DIRECT, alerts and "signal lost" codes. No red buttons, borders
  or countdowns.
- No text under 11px. No 0.15em+ tracking on micro labels.
- Max two aim-bracket frames (`.nl-aim`, `.nl-feed-lock`, reticle) visible per viewport.
  Panels get a blue top seam, not corner brackets.
- No rounded glassy cards, no gradient text on body copy, no outline-only "ghost" titles.
- No `<header>` outside the site header; no `!important` outside `@layer nl-force`.

How far from base: keep the data, ids, `data-*` hooks, JS class names and page structure;
replace everything visual. If a section still reads as "dark card grid with a small eyebrow",
it is not migrated: give it a feed, a band, a wall or a giant number.

## 7. JavaScript

- Colours injected from JS must be tokens: `"var(--blue-2)"`, `"var(--offline)"`, never hex
  (stats.js, match-page.js and valeur.js are converted). Canvas charts cannot read
  `var()`: read it once with `getComputedStyle(document.documentElement).getPropertyValue('--blue-2')`.
- Profile titles: `monitorTitleAccents()` in player-card.js maps every title to the blue scale
  (ultimate, season, manual, auto). `CHARACTER_ULTIMATE_PALETTES` stays as owner data but is
  not rendered on the profile.
- Never rename generated classes or ids (see brief §3). New classes may be added next to them.
- The Chart.js CDN can be unreachable: keep the SVG fallbacks working.

## 8. Profiles

`Joueurs/*/*.html` are generated. Change `scripts/templates/joueur.html`, then from the
site root: `mkdir -p Autre && node scripts/players.mjs`, convert the regenerated files to
CRLF, then `rm -rf Autre` (the script needs that folder to exist). Check that
`Joueurs/retraite/matheo.html` was rewritten too. Never edit `JavaScript/nebula-data.js`.

## 9. Verification before handing a page back

1. Screenshots: serve the site (`pnpm dev`) and check each page at 1440 px and 390 px.
   (1440×900 viewport + full page, 390×844 mobile, reduced motion; prints JS errors).
   Zero JS errors, no horizontal scroll at 390px.
2. 11px floor: in the browser console of the page, at 390 and 1440 wide:
   ```js
   [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
     && parseFloat(getComputedStyle(e).fontSize) < 11 && e.getClientRects().length && !e.closest('svg'))
   ```
   must return an empty array (0px icon-only buttons excepted).
3. Line endings: keep each file's own EOL (`file <path>` before and after editing).
   CRLF: every `.html`, the template, `ROLLOUT.md`, `CSS/` club, global-theme, headtohead,
   home, responsive, rules, saison, theme-monitor; `Joueurs/player-card.*`; the other
   `JavaScript/` files. LF: `CSS/` admin, colors, dream-team, fixtures, hamburger, match,
   players, progression, stats, title, valeur; `JavaScript/` admin, club, dream-team,
   fixtures, match, match-page, progression, rules, saison, stats, valeur.
4. `<!-- meta:start --> … <!-- meta:end -->` untouched; `nebula-data.js` untouched.
5. Keyboard pass: visible `:focus-visible`, `[hidden]` hides, reduced motion stops scans,
   blinking REC and reticle spin.

## Title illustrations

The blueprint drawings of every title come from `JavaScript/title-art.js` (`getTechnicalTitleIllustration`) and `CSS/title-art.css`, shared by `title.html` (slots `[data-title-art]`, filled by `titles.js`) and the player profiles. They draw in `currentColor`: set the colour on the slot (`--blue-3` on the title page, the title accent on profiles), never inside title-art.css.
