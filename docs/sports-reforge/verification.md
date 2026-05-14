# Sports Section Reforge Verification

## Static Checks

Run:

```powershell
cmd /c npm run build
```

Expected:

- Next.js build completes.
- `/sports` is included in the route output.
- No TypeScript errors from `SportsFeatureCard`, `KeychainCustomizer`, or the sports page.

## Browser Checks

Open `/sports` and verify:

- Hero reads as a sports collection page.
- Sporty appears first.
- Sporty has three cards.
- Sporty cards show "No Letters".
- Sporty card customizers show sports charm choices and no letter input.
- Sporty with Spirit appears below Sporty.
- Sporty with Spirit has three cards.
- Sporty with Spirit cards show "Letters On".
- Sporty with Spirit customizers show sports charm choices and a letter input.
- Mobile layout stacks cleanly with no overlapping text.

## Knight Sign-Off

- **Anya**: sections match the intended customer decision path.
- **Galahad**: text, cards, and buttons remain readable at mobile and desktop sizes.
- **Merlin**: sports charm filtering works in both modes.
- **Sentinel**: build and smoke checks are green before deploy.
