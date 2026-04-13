# Shopify Cleanup Report (Dry Run)

Generated: 2026-04-13T18:28:30.512Z
Source: live Storefront API

## Summary

- **Total products**: 43
- **Titles needing cleanup**: 35
- **Duplicate clusters** (same clean title+price): 5
- **Products with empty tags**: 15
- **ProductType distribution**: {"Woven":15,"Keychain":18,"Earrings":10}

## Proposed Title Rewrites

| Current | Proposed | Handle |
|---|---|---|
| Splashy with Soul- 1000011817 | Splashy with Soul | handmade-keychain-1000011817 |
| Splashy with Soul- 1000012019 | Splashy with Soul | handmade-keychain-1000012019 |
| Sporty with Spirit 1000012138 | Sporty with Spirit | handmade-keychain-1000012138 |
| Sporty with Spirit- 1000012195 | Sporty with Spirit | handmade-keychain-1000012195 |
| Sporty with Spirit - 1000012197 | Sporty with Spirit | handmade-keychain-1000012197 |
| Sporty with Spirit- 1473986136160 | Sporty with Spirit | handmade-keychain-1473986136160 |
| Splashy with Soul- 1474164466462 | Splashy with Soul | handmade-keychain-1474164466462 |
| Dual Sequence - 1529285017581-529 | Dual Sequence | handmade-keychain-1529285017581-529 |
| Splashy Aura - 20180228_134138 | Splashy Aura | handmade-keychain-20180228_134138 |
| Sporty with Spirit - 20180228_134358.  Price per keychain | Sporty with Spirit | handmade-keychain-20180228_134358 |
| Splashy with Soul - 20180419_165849 | Splashy with Soul | handmade-keychain-20180419_165849 |
| Sporty with Spirit 20180605_225108 price per keychain | Sporty with Spirit | handmade-keychain-20180605_225108 |
| Dual Sequence- 20180605_225132 | Dual Sequence | handmade-keychain-20180605_225132 |
| Dual Sequence - 20180707_193545 | Dual Sequence | handmade-keychain-20180707_193545 |
| Splashy with Soul - 20180711_211046 | Splashy with Soul | handmade-keychain-20180711_211046 |
| Splashy with Soul - 1000011817 | Splashy with Soul | handmade-keychain-1000011818 |
| Sporty with Spirit - 1000012019 | Sporty with Spirit | handmade-keychain-1000012020 |
| Sporty with Spirit - 1000012138 | Sporty with Spirit | handmade-keychain-1000012139 |
| Sporty with Spirit - 1000012195 | Sporty with Spirit | handmade-keychain-1000012196 |
| Sporty with Spirit - 1000012197 | Sporty with Spirit | handmade-keychain-1000012198 |
| Splashy with Soul - 1000020990 | Splashy with Soul | handmade-keychain-1000020990 |
| Splashy with Soul - 1000020991 | Splashy with Soul | handmade-keychain-1000020991 |
| Dual Sequence - 1000020992 | Dual Sequence | handmade-keychain-1000020992 |
| Sporty with Spirit - 1000020993 | Sporty with Spirit | handmade-keychain-1000020993 |
| Sporty with Spirit - 1473986136160 | Sporty with Spirit | handmade-keychain-1473986136161 |
| Sporty with Spirit 1474164466462 | Sporty with Spirit | handmade-keychain-1474164466463 |
| Dual Sequence- 1529285017581-529 | Dual Sequence | handmade-keychain-1529285017581-530 |
| Cool Skulls- 20180228_134138 | Cool Skulls | handmade-keychain-20180228_134138-1 |
| Splashy Aura- 20180228_134358 | Splashy Aura | handmade-keychain-20180228_134358-1 |
| Dual Sequence - 20180419_165849 | Dual Sequence | handmade-keychain-20180419_165849-1 |
| Splashy with Soul 20180605_225108 | Splashy with Soul | handmade-keychain-20180605_225108-1 |
| Mix and match beads - 20180605_225132 | Mix and match beads | handmade-keychain-20180605_225132-1 |
| Sporty with Spirit 20180707_193545 | Sporty with Spirit | handmade-keychain-20180707_193545-1 |
| Dangle in style - price per pair 20180711_211046 | Dangle in style | handmade-keychain-20180711_211046-1 |
| Matching pair set- price per set. | Matching pair set | handmade-heart-earrings-1 |

## Duplicate Clusters

Each cluster has the same cleaned title + price. Recommended action: keep the one with richer tags/description, merge or delete the others. **DESTRUCTIVE — requires explicit go-ahead + Shopify Admin API token.**

### Cluster 1: Splashy with Soul- 1000011817 ($5.95)
- **Splashy with Soul- 1000011817** — handle:`handmade-keychain-1000011817`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Splashy with Soul- 1000012019** — handle:`handmade-keychain-1000012019`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Splashy with Soul- 1474164466462** — handle:`handmade-keychain-1474164466462`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Splashy with Soul - 20180419_165849** — handle:`handmade-keychain-20180419_165849`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Splashy with Soul - 20180711_211046** — handle:`handmade-keychain-20180711_211046`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Splashy with Soul - 1000011817** — handle:`handmade-keychain-1000011818`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Splashy with Soul - 1000020990** — handle:`handmade-keychain-1000020990`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Splashy with Soul - 1000020991** — handle:`handmade-keychain-1000020991`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Splashy with Soul 20180605_225108** — handle:`handmade-keychain-20180605_225108-1`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`

### Cluster 2: Sporty with Spirit 1000012138 ($5.95)
- **Sporty with Spirit 1000012138** — handle:`handmade-keychain-1000012138`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Sporty with Spirit- 1000012195** — handle:`handmade-keychain-1000012195`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Sporty with Spirit - 1000012197** — handle:`handmade-keychain-1000012197`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Sporty with Spirit- 1473986136160** — handle:`handmade-keychain-1473986136160`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Sporty with Spirit - 20180228_134358.  Price per keychain** — handle:`handmade-keychain-20180228_134358`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Sporty with Spirit 20180605_225108 price per keychain** — handle:`handmade-keychain-20180605_225108`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Sporty with Spirit - 1000012019** — handle:`handmade-keychain-1000012020`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit - 1000012138** — handle:`handmade-keychain-1000012139`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit - 1000012195** — handle:`handmade-keychain-1000012196`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit - 1000012197** — handle:`handmade-keychain-1000012198`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit - 1000020993** — handle:`handmade-keychain-1000020993`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit - 1473986136160** — handle:`handmade-keychain-1473986136161`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit 1474164466462** — handle:`handmade-keychain-1474164466463`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Sporty with Spirit 20180707_193545** — handle:`handmade-keychain-20180707_193545-1`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`

### Cluster 3: Dual Sequence - 1529285017581-529 ($9.95)
- **Dual Sequence - 1529285017581-529** — handle:`handmade-keychain-1529285017581-529`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Dual Sequence- 20180605_225132** — handle:`handmade-keychain-20180605_225132`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Dual Sequence - 20180707_193545** — handle:`handmade-keychain-20180707_193545`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Dual Sequence - 1000020992** — handle:`handmade-keychain-1000020992`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Dual Sequence- 1529285017581-529** — handle:`handmade-keychain-1529285017581-530`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Dual Sequence - 20180419_165849** — handle:`handmade-keychain-20180419_165849-1`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`

### Cluster 4: Splashy Aura - 20180228_134138 ($2.95)
- **Splashy Aura - 20180228_134138** — handle:`handmade-keychain-20180228_134138`, type:`Woven`, tags:[-], desc:`Handcrafted with love. This unique keychain features a custo`
- **Splashy Aura- 20180228_134358** — handle:`handmade-keychain-20180228_134358-1`, type:`Keychain`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`

### Cluster 5: Dangle in style - price per pair 20180711_211046 ($6.95)
- **Dangle in style - price per pair 20180711_211046** — handle:`handmade-keychain-20180711_211046-1`, type:`Earrings`, tags:[auto-ingested,handmade,verify-price], desc:`Hand-woven with love.A unique piece from Lisa's collection.`
- **Dangle in style** — handle:`custom-charm-earrings-1`, type:`Earrings`, tags:[Customizable,Earrings,Jewelry], desc:`Authentic Lisa Custom Earrings. Personalize with your choice`
- **Dangle in style** — handle:`boho-weave-earrings-1`, type:`Earrings`, tags:[Boho,Earrings,Jewelry], desc:`Authentic Lisa Custom Earrings. Intricate woven pattern.`
- **Dangle in Style** — handle:`custom-charm-earrings-2`, type:`Earrings`, tags:[Customizable,Earrings,Jewelry], desc:`Authentic Lisa Custom Earrings. Personalize with your choice`
- **Dangle in style** — handle:`boho-weave-earrings-2`, type:`Earrings`, tags:[Boho,Earrings,Jewelry], desc:`Authentic Lisa Custom Earrings. Intricate woven pattern.`
- **Dangle in style** — handle:`handmade-heart-earrings-3`, type:`Earrings`, tags:[Earrings,Handmade,Jewelry], desc:`Authentic Lisa Custom Earrings. Handcrafted heart design.`
- **Dangle in style** — handle:`custom-charm-earrings-3`, type:`Earrings`, tags:[Customizable,Earrings,Jewelry], desc:`Authentic Lisa Custom Earrings. Personalize with your choice`
- **Dangle in style** — handle:`boho-weave-earrings-3`, type:`Earrings`, tags:[Boho,Earrings,Jewelry], desc:`Authentic Lisa Custom Earrings. Intricate woven pattern.`

## Products with Empty Tags (15)

- handmade-keychain-1000011817 — Splashy with Soul- 1000011817
- handmade-keychain-1000012019 — Splashy with Soul- 1000012019
- handmade-keychain-1000012138 — Sporty with Spirit 1000012138
- handmade-keychain-1000012195 — Sporty with Spirit- 1000012195
- handmade-keychain-1000012197 — Sporty with Spirit - 1000012197
- handmade-keychain-1473986136160 — Sporty with Spirit- 1473986136160
- handmade-keychain-1474164466462 — Splashy with Soul- 1474164466462
- handmade-keychain-1529285017581-529 — Dual Sequence - 1529285017581-529
- handmade-keychain-20180228_134138 — Splashy Aura - 20180228_134138
- handmade-keychain-20180228_134358 — Sporty with Spirit - 20180228_134358.  Price per keychain
- handmade-keychain-20180419_165849 — Splashy with Soul - 20180419_165849
- handmade-keychain-20180605_225108 — Sporty with Spirit 20180605_225108 price per keychain
- handmade-keychain-20180605_225132 — Dual Sequence- 20180605_225132
- handmade-keychain-20180707_193545 — Dual Sequence - 20180707_193545
- handmade-keychain-20180711_211046 — Splashy with Soul - 20180711_211046

## ProductType Normalization

Current types: Woven, Keychain, Earrings

Proposed canonical: `Keychain`, `Earrings`, `Set`. `Woven` should be rolled into `Keychain` (use a tag `woven` to preserve signal).

## Descriptions — The Real Gap

All 43 products use one of 5 boilerplate descriptions. None have:
- Dimensions / materials
- Care instructions
- Charm options
- Clarification of per-keychain vs per-set pricing

These should be rewritten per-product against the corresponding Etsy listing (once Etsy export is available).
