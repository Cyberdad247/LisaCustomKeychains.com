# 🧶 Lisa's Custom Keychains

A premium, headless e-commerce storefront for **Lisa's Custom Keychains**, built with Next.js 15, Tailwind CSS, and the Shopify Storefront API. This site features a unique Polaroid-style product gallery and a focus on handcrafted authenticity.

![Lisa's Custom Keychains](https://i.postimg.cc/cvyv100W/Untitled_design_(2).png)

## 🚀 Features

- **Headless Shopify Integration**: Real-time product fetching and cart management via GraphQL.
- **Polaroid Gallery**: A dynamic, interactive grid using Framer Motion for a "hand-tossed" physical feel.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.
- **Micro-Animations**: Subtle hover effects and smooth transitions for a premium UX.
- **Instant Revalidation**: Configured with `next: { revalidate: 0 }` for immediate sync with Shopify inventory.
- **SEO Optimized**: Built-in best practices for search engine visibility.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **API**: Shopify Storefront API (GraphQL)
- **Language**: TypeScript

## 📦 Project Structure

```text
├── .hive/                # Internal automation & ingestion scripts
├── public/               # Static assets (images, logos)
├── src/
│   ├── app/              # Next.js App Router (Pages & Layouts)
│   ├── components/       # Reusable React components
│   ├── lib/              # Shopify API clients and utilities
│   └── styles/           # Global design system
└── .gitignore            # Security-first exclusion list
```

## ⚙️ Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Cyberdad247/LisaCustomKeychains.com.git
    cd LisaCustomKeychains.com
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-access-token
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3333](http://localhost:3333) to see the result.

## 🚀 Deployment to Production

This project is optimized for deployment on **Vercel**, the platform built by the creators of Next.js.

### Method 1: Automatic Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Automatic Build**:
   - Vercel automatically detects the push to `main`
   - Triggers a production build
   - Deploys to your custom domain

### Method 2: Manual CLI Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Production**:
   ```bash
   npx vercel --prod --scope invisionedmarketing
   ```

3. **Monitor Build**:
   - The CLI will display the build progress
   - Once complete, you'll receive a production URL

### Environment Variables on Vercel

Ensure these are set in your Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Your Storefront API token |

### Post-Deployment

- **Production URL**: Your site will be live at your configured domain
- **SSL**: Automatically provisioned by Vercel
- **CDN**: Global edge network for optimal performance

## 🛡️ Security Note

This repository is configured to **never** track Shopify Admin API keys or local credentials. All scripts in `.hive/` and environment files are ignored by Git to ensure store safety. Use the provided template in `.env.example` (if available) to set up your own environment.

## 🎨 Design Philosophy

"Every Knot Tells a Story." The design uses a mix of serif typography (`Playfair Display`) and friendly rounded fonts (`Quicksand`), combined with a soft, organic color palette of purples and pinks to reflect the handcrafted nature of the products.

---
*Created with ❤️ by the Antigravity Swarm.*
