"use client";

import { type ShopifyProduct } from "../lib/shopify/types";

interface ProductJSONLDProps {
    products: ShopifyProduct[];
}

export default function ProductJSONLD({ products }: ProductJSONLDProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://lisascustomkeychains.com/#products`,
            "name": product.title,
            "image": product.featuredImage?.url,
            "description": product.description,
            "offers": {
                "@type": "Offer",
                "price": product.priceRange?.minVariantPrice?.amount || "9.95",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
