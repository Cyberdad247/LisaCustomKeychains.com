---
description: How to point your Namecheap domain to your Vercel project
---

# 🌐 Connect Namecheap Domain to Vercel

This workflow guides you through "transferring" your domain's traffic to Vercel. Note that you will keep paying Namecheap for the domain renewal, but Vercel will handle the website hosting and SSL.

## Phase 1: Vercel Configuration

1.  Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project: **lisa-custom-keychains-com**.
3.  Go to **Settings** > **Domains**.
4.  Enter your domain: `lisacustomkeychains.com` and click **Add**.
5.  Select the recommended option (likely **Add domain**).
6.  Vercel will display a set of **Nameservers** intended for your domain. They typically look like:
    *   `ns1.vercel-dns.com`
    *   `ns2.vercel-dns.com`
    *   (Keep this tab open!)

## Phase 2: Namecheap Configuration

1.  Log in to [Namecheap](https://www.namecheap.com/).
2.  Go to **Domain List** on the left sidebar.
3.  Find `lisacustomkeychains.com` and click the **Manage** button.
4.  Scroll down to the **Nameservers** section.
5.  Change the dropdown from **Namecheap BasicDNS** to **Custom DNS**.
6.  Enter the Vercel Nameservers you got in Phase 1:
    *   Line 1: `ns1.vercel-dns.com`
    *   Line 2: `ns2.vercel-dns.com`
7.  Click the **green checkmark** to save.

## Phase 3: Propagation

*   DNS changes can take up to **24-48 hours**, but usually happen within minutes.
*   Go back to Vercel. Once the domain has a checkmark next to it, SSL will be generated automatically.

> **Note:** This method delegates all DNS control to Vercel, which is the easiest way to ensure your email setup (if any) and subdomains work seamlessly with your Vercel deployment.
