---
description: How to deploy the Lisa Custom Keychains storefront to a free hosting platform (Vercel)
---

# 🚀 Deployment Workflow

This workflow guides you through deploying your Next.js storefront to **Vercel**, the most optimized platform for this technology.

## 1. Connect to Vercel (Free Tier)
1. Go to [Vercel.com](https://vercel.com) and Sign Up using your **GitHub account**.
2. Click **"Add New"** > **"Project"**.

## 2. Import Repository
1. Find your repository: `Cyberdad247/LisaCustomKeychains.com`.
2. Click **Import**.

## 3. Configure Environment Variables
In the **Environment Variables** section, you MUST add these keys (copy them from your local `.env.local` or `ShopifyCredentials.txt`):

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `jgvme0-av.myshopify.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `17d65b0dd4f3b0c463b4ad9611939b59` |

## 4. Deploy
1. Click **Deploy**.
2. Vercel will automatically build your Next.js app and provide a production URL (e.g., `lisacustomkeychains.vercel.app`).

## 5. Connect Your Custom Domain
1. Once deployed, go to **Settings** > **Domains**.
2. Enter your custom domain (e.g., `lisacustomkeychains.com`).
3. Vercel will provide DNS records (A and CNAME). Update these in your domain registrar (GoDaddy, Namecheap, etc.).
4. Wait for SSL to propagate (usually 5-10 minutes).

## 💡 Why Vercel?
- **Global Edge Network**: Your Polaroid gallery will load instantly everywhere.
- **Automatic CI/CD**: Every time you `git push`, your site updates automatically.
- **Serverless Scaling**: Handles traffic spikes without any configuration.

---
*Alternative: If you prefer **Netlify**, the process is nearly identical. Just link your GitHub and set the same Environment Variables.*
