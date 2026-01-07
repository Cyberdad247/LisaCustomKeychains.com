import React from 'react';
import { ShopifyProduct } from '../lib/shopify';

interface SEOWrapperProps {
  product: ShopifyProduct;
}

export default function SEOWrapper({ product }: SEOWrapperProps) {
  // 🧠 Vizion Logic: Auto-generate rich descriptions
  const keywords = ["Handcrafted", "Custom Keychain", "Beaded Accessories", "Personalized Gift", "Yarn Craft"];
  const dynamicDescription = product.description 
    ? product.description
    : `Experience the charm of a ${keywords[0]} ${product.title}. Perfect as a ${keywords[3]}, this ${keywords[4]} item showcases artisan quality. Available now at Lisa's Custom Keychains.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": dynamicDescription,
    "image": product.featuredImage?.url,
    "brand": {
      "@type": "Brand",
      "name": "Lisa's Custom Keychains"
    },
    "offers": {
      "@type": "Offer",
      "price": product.priceRange?.minVariantPrice?.amount,
      "priceCurrency": product.priceRange?.minVariantPrice?.currencyCode,
      "availability": "https://schema.org/InStock",
      "url": typeof window !== 'undefined' ? window.location.href : '',
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
