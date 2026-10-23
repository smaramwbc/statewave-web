# v8 page checklist

Read this before building or reviewing any v8 page. It lists the gaps found when `/product` was compared with the homepage. Every new page must clear each item before it ships. The reference implementation is `src/pages/HomePage.tsx` + `src/components/home/*`. The second one is `src/pages/ProductPage.tsx` + `src/components/product/*`.

## Chrome (navbar, floating widgets)

- [ ] **Navbar over a dark hero.** If the page opens on a navy hero, add its route to `CLEAR_TOP` in `src/components/Navbar.tsx`. The bar then starts transparent and turns into the floating pill on scroll, exactly like `/`. Without it the page shows a white pill on first paint and looks different from home.
- [ ] Below the hero the bar picks its tone from the section under it automatically. Don't fight it with page CSS.
- [ ] Check that the floating "Ask Support" pill (`ChatWidget`) covers nothing important at 1280–1440 and 390px.

## Hero

- [ ] Primary CTA uses the homepage button: `sw-btn sw-btn--solid sw-hero__cta`, with `<span aria-hidden className="sw-hero__go">→</span>` inside. Not a plain "Get started →" text button.
- [ ] Keep the glow restrained. Peak alpha is about 0.3, not 0.6. The horizon arc is the hero's one accent; no stacked glows.
- [ ] **Floating extras** (toasts, badges, callouts around a mock) are hidden by default. They float in on hover/focus of their stage, and are hidden on phones. Never show them on load: they crowd the mock and cover its content.
- [ ] The hero mock may assemble once on load: rows rising in sequence over about 1.5s, then still. Don't loop it, and don't count up figures in the claim (no animating the stats).

## Interaction (every card responds)

- [ ] **Every card** lifts on hover. The lift is `translateY(-3px … -4px)` plus a deeper shadow, with a 0.35s `cubic-bezier(0.2, 0.8, 0.2, 1)` transition. On dark cards, the border brightens instead of the shadow.
- [ ] Icons never rotate or spin on hover; it reads as gimmicky. At most a colour change on the tile.
- [ ] **Rows inside cards** react on their own: list rows slide 4px and get an accent border, key/value rows get a `--sw-tint` background, chips turn accent.
- [ ] Every toggle or segmented control actually changes what is shown. Use the `Seg` control in `components/product/ui.tsx`.
- [ ] Linked pairs highlight together. For example, hovering an episodic row highlights its semantic fact.

## Scroll behaviour

- [ ] **Stepped walkthroughs pin on desktop.** From 1100px (the homepage uses 1000px) the section is about 340vh tall, the grid is `position: sticky`, and scroll position picks the step. The progress bar under the active step fills with scroll (`--f`). Clicking a step scrolls to it. Copy the code from `components/product/HowItWorks.tsx` or `components/home/HowItWorks.tsx`.
- [ ] On narrower screens the steps auto-advance while on screen and stop at the first click. Under reduced motion nothing auto-advances.
- [ ] Each time a step opens, its visual rebuilds with a short stagger (rows `pd-in`, `--i` × 90ms).
- [ ] Cards rise in as they enter the viewport (`sw-rise` on `animation-timeline: view()`, inside `@supports`). It's pure CSS, so the server HTML is never hidden.
- [ ] Bars, meters and gauges fill or draw as they scroll in. That's geometry, not numbers: never animate the figure text.
- [ ] Every one of these stops under `prefers-reduced-motion`. The `.sw-home *` rule in `home.css` already does this, as long as the page sits under `.sw-home`.

## Code and copy buttons

- [ ] Copy buttons are **icon-only**. Use `CopyBtn` from `components/home/code.tsx` (copy icon, then a check when copied). Never the word "Copy", and always give it an `aria-label` that names what gets copied.
- [ ] Code is highlighted with `Code` from `components/home/code.tsx`, not a second highlighter.
- [ ] Samples must run as written: no `[...]` placeholders, and method names checked against the published SDK.

## Illustration art

- [ ] Illustration panels use the **homepage treatment**: the designer's dithered art in full colour at full opacity on `#f4f7fd`, with a pointer parallax between backdrop and card (`useParallax` in `components/home/hooks.ts`). Never fade the art to low opacity (it turns into a muddy blob) and never recolour it yourself (it looks generated).
- [ ] Inside bento cards keep the palette to navy, accent blue and greys. Use status colours (green, amber, red) only where they carry meaning, like a verdict pill, never as decoration or fills.
- [ ] Card surfaces are white with a hairline border, not a solid grey slab. Put diagrams on a `--sw-well` inset.

## Layout guards

- [ ] No horizontal scroll at 1440, 1380, 1280, 1100, 768 or 390px. Test 1380 in particular: two fixed hero columns plus the gap overflow there first.
- [ ] Floating elements must not sit on top of the main mock's content at any width.
- [ ] Every grid track is `minmax(0, …)`; flex children that truncate need `min-width: 0`.
- [ ] Page CSS lives in its own file, scoped under the page class (for example `.sw-pd`), next to `.sw-home`. No unscoped rules.
- [ ] Colours come from the tokens in `src/styles/tokens.css`. Add new ones there; no raw hex in components.

## Verify

```
npm run typecheck && npm run lint && npm test && npm run build
```

Then load the page in the dev server. Check the hover states, the pinned scroll at 1440, the auto-advance at 768, and reduced motion. Confirm `dist/<route>/index.html` has the page's text and no duplicated JSON-LD.
