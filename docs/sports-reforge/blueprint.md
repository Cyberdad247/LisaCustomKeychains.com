# Sports Section Reforge Blueprint

## Goal

Rebuild the sports page so shoppers immediately understand the two sports customization paths:

1. **Sporty** - sports charms only, no letter beads.
2. **Sporty with Spirit** - sports charms plus letters for names, initials, team abbreviations, or school spirit.

## Section Contract

### Sporty

- Layout: three photo cards.
- Photo direction: sports charm table, finished sports examples, and game-day charm crops.
- Customizer behavior: `lockLetters=true`, `charmCategory="sports"`.
- Buyer promise: choose team colors and one sports charm; letters stay off.

### Sporty with Spirit

- Layout: three photo cards directly below Sporty.
- Photo direction: keychains that show sports charms with letter beads or personalization context.
- Customizer behavior: `lockLetters=false`, `forceLetters=true`, `charmCategory="sports"`.
- Buyer promise: choose team colors, choose a sports charm, and add a short name, initials, or team letters.

## Knight Assignments

- **Anya**: product architecture, page hierarchy, and copy clarity.
- **Galahad**: UI/UX readability, mobile spacing, card clarity, and accessibility labels.
- **Merlin**: customizer behavior, sports charm filtering, and letter-mode routing.
- **Forge Knight**: implementation in the Next.js sports page and feature card component.
- **Sentinel**: build verification, regression checks, and deployment readiness.

## Implementation Map

- `src/app/sports/page.tsx` owns the page hierarchy and product selection.
- `src/components/sports/SportsFeatureCard.tsx` owns the reusable sports card and customizer trigger.
- `src/components/customize/KeychainCustomizer.tsx` accepts `forceLetters` so the spirit lane can open letters even when a low-priced fallback product would normally behave like a basic tier.

## Acceptance Criteria

- The old generic sports gallery and old inspiration strip are removed from `/sports`.
- The page shows exactly two named sections: Sporty and Sporty with Spirit.
- Each section has three photo cards.
- Sporty cards open sports-only customization with no letter input.
- Sporty with Spirit cards open sports-only charm filtering with letter input enabled.
- Build passes.
