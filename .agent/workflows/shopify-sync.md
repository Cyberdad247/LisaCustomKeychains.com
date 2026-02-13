---
description: How to safely sync local product definitions to Shopify
---

# Shopify Sync Workflow

This workflow efficiently synchronizes your local product definitions (in `scripts/sync_shopify_products.js`) with your Shopify store. 

## Features
- **Idempotent:** Safely checks if products/collections exist before creating them.
- **Secure:** Uses `shpat_` access token from `.env.local` (or environment variables).
- **Efficient:** Uses native Node.js REST API calls for direct, dependency-free synchronization.

## Prerequisites
1. Ensure `.env.local` has valid credentials:
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_ADMIN_API_ACCESS_TOKEN` (must start with `shpat_`)
2. Ensure images exist in `public/images/`.

## Usage

### 1. Run the Sync Script
Execute the following command in your terminal:

```bash
npm run sync:products
```

### 2. Verify Output
- Look for `✅ Exists` or `🎉 Created` messages.
- If errors occur, check the console output for details (401 = Auth Error, 422 = Validation Error).

## Adding New Products
To add new products to the sync list:
1. Open `scripts/sync_shopify_products.js`.
2. Add a new object to the `PRODUCTS_TO_SYNC` array.
3. Run `npm run sync:products`.
