# Shopify Admin API Authentication Guide

## 🚨 Current Status: BLOCKED (401 Unauthorized)

The scripts are currently unable to authenticate with the Shopify Admin API because the provided credentials in `.env.local` are incorrect for API access.

### The Problem
- **Current `SHOPIFY_ADMIN_API_ACCESS_TOKEN`**: Starts with `fed5...` (This is an **API Key**, not an Access Token).
- **Current `SHOPIFY_API_SECRET`**: Starts with `shpss_...` (This is a **Shared Secret**, used for webhooks, NOT for API authentication).

To access the Admin API (required for creating products/collections), you need one of the following:

---

### Option A: Admin API Access Token (Recommended)
**Best for:** Custom Apps created in Admin Settings.

1. Go to your Shopify Admin > **Settings** > **Apps and sales channels**.
2. Click **Develop apps**.
3. Select your app (or create a new one).
4. Go to **API credentials**.
5. Look for **Admin API access token**.
   - It should start with `shpat_`.
   - If revealed once, you cannot see it again. You may need to "Uninstall" and "Install" the app to generate a new one.
6. **Action:** Copy this `shpat_...` token.
7. **Update `.env.local`:**
   ```bash
   SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Option B: Legacy Private App Password
**Best for:** Older "Private Apps" (if enabled).

1. Go to **Settings** > **Apps and sales channels** > **Develop apps** (or "Manage private apps" if legacy link exists).
2. Find your Private App.
3. Look for **Password**.
   - It should start with `shppa_`.
4. **Action:** Copy this `shppa_...` password.
5. **Update `.env.local`:**
   ```bash
   SHOPIFY_API_PASSWORD=shppa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   *(Note: You will need to update the scripts to use `SHOPIFY_API_PASSWORD` if you choose this route, but Option A is preferred).*

---

### ⚠️ Important: API Scopes
Ensure your app has the following **Admin API Scopes** enabled:
- `write_products`
- `read_products`
- `write_product_listings`
- `read_product_listings`

Without these scopes, even a correct token will fail (though usually with `403 Forbidden`, not `401 Unauthorized`).
