# Security Notes

## Public Storefront

The public customer site is `https://www.lisascustomkeychains.com`.

## Private Client Editor

The client editor lives at `/client-editor` and must remain private. Configure
these server-only environment variables in Vercel before using it:

- `OWNER_DASHBOARD_PASSWORD`
- `OWNER_DASHBOARD_SECRET`

Do not expose these values in client-side code, commits, screenshots, or logs.

## Shopify Boundary

Shopify remains the source of truth for products, inventory, checkout, and admin
workflows. The Shopify app is single-merchant and should only allow Lisa Custom
Keychains shops: `jgvme0-av.myshopify.com` and `lisascustomkeychains.myshopify.com`.
