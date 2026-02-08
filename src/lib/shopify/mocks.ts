// 🐝 [HIVE_SWARM_STAMP] Autonomously Extracted by Anya Sharma
import { ShopifyProductEdge } from "./types";

export const mockProducts: ShopifyProductEdge[] = [
    {
        node: {
            id: "gid://shopify/Product/20180711_211046",
            title: "Dangle in style",
            handle: "dangle-in-style-20180711_211046",
            description: "Hand-crafted premium earrings at a special value price. Perfect for gifting or completing your look.",
            productType: "Earrings",
            featuredImage: {
                url: "/images/mockearring.png",
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
            id: "gid://shopify/Product/mock-bracelet-1",
            title: "Classic Woven Heritage Bracelet",
            handle: "classic-woven-heritage-bracelet",
            description: "Timeless woven design, handcrafted for durability and style. Perfect for any wrist.",
            productType: "Bracelets",
            featuredImage: {
                url: "/images/20180228_134138.jpg",
                altText: "Woven Heritage Bracelet",
            },
            priceRange: {
                minVariantPrice: { amount: "12.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/20180228_134138.jpg", altText: "Woven Heritage Bracelet" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-b-1", title: "Default", availableForSale: true, price: { amount: "12.95", currencyCode: "USD" } } }],
            },
        },
    },
    {
        node: {
            id: "gid://shopify/Product/mock-bracelet-2",
            title: "Victory Sports Bracelet",
            handle: "victory-sports-bracelet",
            description: "Show your team spirit with our durable sports-themed woven bracelets.",
            productType: "Bracelets",
            featuredImage: {
                url: "/images/20180605_225108.jpg",
                altText: "Sports Heritage Bracelet",
            },
            priceRange: {
                minVariantPrice: { amount: "10.95", currencyCode: "USD" },
            },
            images: {
                edges: [{ node: { url: "/images/20180605_225108.jpg", altText: "Sports Heritage Bracelet" } }],
            },
            variants: {
                edges: [{ node: { id: "gid://shopify/ProductVariant/m-b-2", title: "Default", availableForSale: true, price: { amount: "10.95", currencyCode: "USD" } } }],
            },
        },
    }

];
