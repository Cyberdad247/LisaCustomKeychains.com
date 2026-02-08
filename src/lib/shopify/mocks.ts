// 🐝 [HIVE_SWARM_STAMP] Autonomously Extracted by Anya Sharma
import { ShopifyProductEdge } from "./types";

export const mockProducts: ShopifyProductEdge[] = [
    {
        node: {
            id: "gid://shopify/Product/mock-earrings-1",
            title: "Signature Heritage Earrings",
            handle: "signature-heritage-earrings",
            description: "Hand-crafted premium earrings at a special value price. Perfect for gifting or completing your look.",
            productType: "Earrings",
            featuredImage: {
                url: "/images/heart_earrings_close_up.jpg",
                altText: "Signature Heritage Earrings",
            },
            priceRange: {
                minVariantPrice: { amount: "7.95", currencyCode: "USD" },
            },
            images: {
                edges: [
                    { node: { url: "/images/earrings_feature.jpg", altText: "Earrings Feature" } },
                    { node: { url: "/images/earrings_1.jpg", altText: "Earrings Style 1" } },
                ],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-e-1", title: "Default", availableForSale: true, price: { amount: "7.95", currencyCode: "USD" } } }],
            },
        },
    },
    {
        node: {
            id: "gid://shopify/Product/mock-earrings-2",
            title: "Artisan Crystal Bloom Earrings",
            handle: "artisan-crystal-bloom",
            description: "Elegant bloom design crafted with artisanal care.",
            productType: "Earrings",
            featuredImage: {
                url: "/images/earrings_2.jpg",
                altText: "Artisan Crystal Bloom",
            },
            priceRange: {
                minVariantPrice: { amount: "7.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/earrings_2.jpg", altText: "Bloom Style" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-e-2", title: "Default", availableForSale: true, price: { amount: "7.95", currencyCode: "USD" } } }],
            },
        },
    },
    {
        node: {
            id: "gid://shopify/Product/mock-earrings-3",
            title: "Woven Charm Earrings",
            handle: "woven-charm-earrings",
            description: "Boho-chic woven charm earrings that move with you.",
            productType: "Earrings",
            featuredImage: {
                url: "/images/earrings_3.jpg",
                altText: "Woven Charms",
            },
            priceRange: {
                minVariantPrice: { amount: "7.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/earrings_3.jpg", altText: "Woven Charms" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-e-3", title: "Default", availableForSale: true, price: { amount: "7.95", currencyCode: "USD" } } }],
            },
        },
    },
    {
        node: {
            id: "gid://shopify/Product/mock-woven-1",
            title: "Classic Woven Heritage Keychain",
            handle: "classic-woven-heritage",
            description: "Timeless woven design, handcrafted for durability and style.",
            productType: "Woven",
            featuredImage: {
                url: "/images/20180228_134138.jpg",
                altText: "Woven Heritage",
            },
            priceRange: {
                minVariantPrice: { amount: "12.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/20180228_134138.jpg", altText: "Woven Heritage" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-w-1", title: "Default", availableForSale: true, price: { amount: "12.95", currencyCode: "USD" } } }],
            },
        },
    },
    {
        node: {
            id: "gid://shopify/Product/mock-sports-1",
            title: "Victory Sports Keychain",
            handle: "victory-sports",
            description: "Show your team spirit with our durable sports-themed keychains.",
            productType: "Sports",
            featuredImage: {
                url: "/images/20180605_225108.jpg",
                altText: "Sports Heritage",
            },
            priceRange: {
                minVariantPrice: { amount: "10.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/20180605_225108.jpg", altText: "Sports Heritage" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-s-1", title: "Default", availableForSale: true, price: { amount: "10.95", currencyCode: "USD" } } }],
            },
        },
    },
    {
        node: {
            id: "gid://shopify/Product/mock-sets-1",
            title: "Heritage Gift Set (Trio)",
            handle: "heritage-gift-set",
            description: "A bundled set of our most popular designs, ready for gifting.",
            productType: "Sets",
            featuredImage: {
                url: "/images/20180707_193545.jpg",
                altText: "Heritage Gift Set",
            },
            priceRange: {
                minVariantPrice: { amount: "24.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/20180707_193545.jpg", altText: "Heritage Gift Set" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-set-1", title: "Default", availableForSale: true, price: { amount: "24.95", currencyCode: "USD" } } }],
            },
        },
    },

];
