# 5th Grade — Mission: Move!

Interactive PE lessons for 5th grade, hosted on GitHub Pages and embedded in Canvas via `<iframe>`.
All lessons share one theme shell (`assets/lesson.css` + `assets/lesson.js`) and carry the Canvas
reading text **verbatim**, wrapped in interactive activities.

**Live base:** `https://optimaondemand.github.io/OAO-PE/5th-Grade/lessons/`

## Units

| Unit | Lesson | Page |
|------|--------|------|
| 1.1 | Intro to P.E. | `unit-1-1-intro.html` |
| 1.2 | Warm-Ups & Cool-Downs | `unit-1-2-warm-ups-and-cool-downs.html` |
| 1.3 | Muscular Strength & Endurance | `unit-1-3-muscular-strength-and-endurance.html` |
| 1.4 | Cardiovascular Fitness | `unit-1-4-cardiovascular-fitness.html` |
| 1.5 | Flexibility & Stretching | `unit-1-5-flexibility-and-stretching.html` |
| 1.6 | Nutrition | `unit-1-6-nutrition.html` |
| 1.7 | Locomotor Skills | `unit-1-7-locomotor-skills.html` |
| 1.8 | Throwing & Catching | `unit-1-8-throwing-and-catching.html` |
| 1.9 | Kicking & Striking | `unit-1-9-kicking-and-striking.html` |
| 1.10 | Teamwork & Cooperation | `unit-1-10-teamwork-and-cooperation.html` |
| 1.11 | Sportsmanship & Respect | `unit-1-11-sportsmanship-and-respect.html` |
| 1.12 | Fitness Components | `unit-1-12-fitness-components.html` |
| 1.13 | Personal Space & Movement Safety | `unit-1-13-personal-space-and-movement-safety.html` |
| 1.13 | · Water Safety (gap-closing) | `unit-1-13a-water-safety.html` |
| 1.13 | · Cycling Safety (gap-closing) | `unit-1-13b-cycling-safety.html` |
| 1.14 | Rhythmic Movement & Dance | `unit-1-14-rhythmic-movement-and-dance.html` |
| 1.15 | Balance & Coordination | `unit-1-15-balance-and-coordination.html` |
| 1.16 | Goal Setting & Personal Fitness Plans | `unit-1-16-goal-setting-and-fitness-plans.html` |

## How to embed in Canvas

Open the Canvas page → Edit → `<>` (HTML editor) → paste an iframe pointing at the lesson's live
URL, e.g.:

```html
<iframe src="https://optimaondemand.github.io/OAO-PE/5th-Grade/lessons/unit-1-2-warm-ups-and-cool-downs.html"
  height="840" style="width:100%; border:0; border-radius:14px; box-shadow:0 8px 30px rgba(14,28,66,0.12);"
  loading="lazy" title="Mission: Move! 5th Grade — Unit 1.2"></iframe>
```

Height 840 is a contained "module" viewport; the sticky progress rail, scroll-reveal, and
Mission-Complete payoff all rely on the embed scrolling internally.

## Structure

- `lessons/` — one self-contained HTML page per unit (links the shared `../assets/` shell).
- `assets/lesson.css` — the Athlete Training HQ theme (extracted from the Unit 1.1 pilot).
- `assets/lesson.js` — framework: briefing intro, progress rail, scroll-reveal, Mission Complete,
  and data-attribute activity widgets (flip cards, flashcards, tap explorers, reveal buttons,
  tally rings, reflection journals).
- `assets/*.mp4` + `*-poster.jpg` — each unit's lesson video and generated poster frame.
- `assets/optima-owl.png` — the Optima owl used in every lesson's branding.
