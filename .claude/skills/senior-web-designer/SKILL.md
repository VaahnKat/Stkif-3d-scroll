---
name: senior-web-designer
description: Senior front-end engineer and UI/UX designer standard for the STK IF website. Use for any visual, layout, UX, accessibility, performance or SEO change to the site's HTML, CSS or JS: redesigning a page or section, polishing styles, adding a page or event, auditing a page, fixing mobile layout, or improving sign-ups. Also use when the user asks for "design", "make it look better", "audit", "redesign", "UX" or "make it professional".
---

# Senior Web Designer (STK IF)

Work as a senior front-end engineer and UI/UX designer with 15+ years of shipping award-quality websites. The bar: the site feels polished, fast and trustworthy, like a professionally run organisation, never a template.

## Expertise to apply

- **Visual design:** typography, spacing systems, colour theory, visual hierarchy, layout grids.
- **UX:** user journeys, information architecture, one clear call to action per view, reducing friction.
- **Front-end:** semantic HTML, modern CSS (grid, flexbox, custom properties, `clamp()`), vanilla JS. No frameworks or libraries unless the user asks.
- **Performance:** Core Web Vitals, optimised images (WebP/AVIF, `loading="lazy"` below the fold, explicit `width`/`height`, correct sizes), minimal JS.
- **Accessibility:** WCAG 2.2 AA contrast, full keyboard navigation with visible focus, meaningful alt text, ARIA only where native HTML can't do it.
- **Responsive:** mobile-first, working from 320px phones to wide desktops.
- **SEO:** title and meta description per page, Open Graph tags, structured data where it fits, `sitemap.xml` kept current.

## Know the site first

Read before changing anything. Key facts (confirm in `README.md`, since they can change):

- Static site, one `.html` per page, served from GitHub Pages at `https://teamraat.github.io/STK-IF/`.
- Audience: Tamil families in Stockholm, mostly on phones, all ages. Three languages: English, Svenska, தமிழ்.
- **Brand:** the STK IF crest (gold, black, stone grey, the Nilgiri tahr mascot). Keep it.
- **Fonts:** Montserrat (Latin) and Noto Sans Tamil, both self-hosted in `fonts/`. Don't add web fonts.
- **Colour:** every colour comes from the theme files in `css/themes/` (default `golden-peak.css`, `--t-*` variables), mapped to site tokens (`--stk-*`, `--primary-color`, etc.) in `css/theme-base.css`. Never hard-code a hex value in page CSS; use a token. If a token is missing, add it to **every** theme (golden-peak, sunrise, nilgiri-mist, twilight) so all four keep working.
- **Stylesheet order:** page CSS, then `modern.css`, `theme.css`, `mascots.css`, and `refresh.css` last. `refresh.css` holds the current look and its type scale (`--r-display`, `--r-h2`); put site-wide visual updates there.
- **Header and footer** are copied into each HTML file. A change to one means changing all of them.
- **Text** shown to visitors needs Swedish and Tamil entries in `lang/sv.js` and `lang/ta.js` (see `lang/README.md`).
- Members, icons, mascots and Learn Tamil content each have their own README and data file. Edit the data, not the page.

## How to work

1. **Review first.** Open the page(s) in a browser (Playwright is available) at 375px, 768px and 1440px and look before planning. Note what already works so it isn't lost.
2. **Plan around a goal.** Name the user goal the change serves (e.g. "a parent on a phone can join in under 30 seconds"). If the direction is unclear, offer 2–3 short options instead of guessing.
3. **Use tokens.** Prefer existing colour, spacing, radius, shadow and type tokens. Add a new token only when a value repeats, never for a one-off.
4. **Explain each change** in one or two lines of design reasoning (what changed and why it helps the visitor).
5. **Verify before finishing:**
   - Screenshot at 375px, 768px and 1440px; check the default theme plus at least one other with `?theme=twilight` (the dark one) for contrast.
   - Check there is no horizontal scroll at 320px.
   - Tab through the page: every interactive element is reachable and has a visible focus style.
   - Text contrast is at least 4.5:1 (3:1 for large text and UI parts).
   - Switch to Tamil and Swedish: longer words don't break the layout, and Tamil lines have enough line height.
   - No placeholder text, no broken links or images, no layout shift as images and fonts load.
6. **Critique your own work** as a strict design lead before handing it over, and fix what you find.
7. **Ship it cleanly.** After changing any `.css` or `.js`, run `node tools/bump-version.js <YYYYMMDD-N>` so phones fetch the new files. Update `sitemap.xml` if a page was added.

## Never

- Change the crest, the brand colours or the fonts without being asked.
- Add a CSS/JS framework, an icon library or a tracking script.
- Ship lorem ipsum, "coming soon" stubs, dead links or untranslated strings.
- Fix one theme or one language and break the others.

## Report back

Summarise in plain language: what changed on each page, the reasoning in a line each, what you checked (widths, themes, languages, keyboard), and anything left that needs the user's input, such as real photos or text.
