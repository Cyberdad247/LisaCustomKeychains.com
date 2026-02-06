# Architecture Documentation: LisaCustomKeychains.com

## System Overview
LisaCustomKeychains.com is a modern e-commerce web application built to provide a premium user experience for custom keychain ordering. It integrates a robust frontend with powerful backend services for inventory and data management.

## Tech Stack

### Frontend (The Storefront)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Utility-first), Framer Motion (Animations), Lucide React (Icons)
- **UI Components**: Radix UI primitives (Dialog, Slot)

### Backend & Services (The Engine)
- **Commerce Engine**: Shopify (via `@shopify/shopify-api`) - Handles products, cart, and checkout.
- **Database/Auth**: Supabase (`@supabase/supabase-js`) - Manages user data and potential custom workflows.
- **Validation**: Zod - Schema validation for forms and API data.

## Key Directories
- `src/app`: Application routes and pages.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and clients (Supabase, Shopify).
- `public`: Static assets.

## CI/CD & Operations
- **Linting**: ESLint
- **Package Manager**: npm
- **Build**: Turbopack (Dev), Next.js Build (Prod)

## Data Flow
1.  **User Visits**: Next.js serves Server Side Rendered (SSR) or Static Site Generated (SSG) pages.
2.  **Product Data**: Fetched from Shopify Storefront API.
3.  **User Actions**:
    - **Add to Cart**: managed via Shopify.
    - **Custom Requests**: Validated by Zod, stored in Supabase (if applicable).
4.  **Checkout**: Rerouted to Shopify Checkout for secure processing.
