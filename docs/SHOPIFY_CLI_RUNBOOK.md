# Shopify CLI Runbook

## Purpose

Use Shopify CLI as the live store verification path before trusting local mock product data or older helper scripts.

## Current Store Target

- Store admin: `https://jgvme0-av.myshopify.com/admin`
- CLI store domain: `jgvme0-av.myshopify.com`

## Windows Note

PowerShell can block the global `shopify.ps1` shim with an execution-policy error. Use one of these paths:

```powershell
cmd /c shopify version
npm run shopify:cli:probe
npm run shopify:cli:auth
```

`npm run ...` executes through the Node/npm command layer and avoids the blocked PowerShell shim in normal Windows shells.

## First-Time Auth

Run:

```powershell
npm run shopify:cli:auth
```

This stores Shopify CLI auth for `jgvme0-av.myshopify.com` with these scopes:

- `read_products`
- `write_products`
- `read_product_listings`
- `write_product_listings`

The command may open a browser or provide a device-login flow. Complete that login as the Shopify account that owns Lisa's Custom Keychains.

## Verify Store Access

Run:

```powershell
npm run shopify:cli:probe
```

Expected result: JSON containing the shop name, `myshopifyDomain`, and primary domain URL.

If this fails with `No stored app authentication found`, run `npm run shopify:cli:auth` first.

## Local Storefront Build

The Next.js storefront still needs a Storefront API token in `.env.local`.

Create `.env.local` from `.env.example` and fill in:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=jgvme0-av.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN=jgvme0-av.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
```

Admin scripts also need:

```env
SHOPIFY_ADMIN_API_ACCESS_TOKEN=...
```

Do not commit `.env.local` or real Shopify tokens.
