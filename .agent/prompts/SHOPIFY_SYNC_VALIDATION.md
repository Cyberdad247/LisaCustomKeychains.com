---
description: Validates Shopify credentials and store connectivity
---
# Shopify Sync Validation Protocol

This protocol validates the connection between Camelot OS and the Shopify Storefront API.

## 1. Environment Verification
The `.env.local` file must contain:
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`

## 2. Connectivity Test
Run the verification script to probe the API:
```bash
node scripts/verify_shopify.js
```

## 3. Success Criteria
- [ ] Script returns exit code 0
- [ ] Connects to correct store domain
- [ ] Retrieves at least 1 product
- [ ] Validates currency code matches store settings (usually USD)
- [ ] No API errors (401, 403, 404)

## 4. Troubleshooting
- **401 Unauthorized**: Check Access Token. Ensure it's for the "Storefront API", not Admin API.
- **404 Not Found**: Check Store Domain. formatting (e.g. `your-store.myshopify.com`).
- **Empty Products**: Ensure products are "Active" and available to the "Headless" sales channel.
