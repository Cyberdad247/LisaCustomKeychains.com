/**
 * 📦 SHOPIFY SOVEREIGN TYPES
 *
 * Type definitions for the Shopify Storefront API integration.
 *
 * @module @/lib/shopify/types
 * @author Lukas Swarm (Invisioned Marketing Inc.)
 */

export interface ShopifyImage {
    url: string;
    altText: string;
}

export interface ShopifyMoney {
    amount: string;
    currencyCode: string;
}

export interface ShopifyProductVariant {
    id: string;
    title: string;
    price: ShopifyMoney;
    availableForSale: boolean;
    quantityAvailable?: number;
    product?: {
        title: string;
        featuredImage: ShopifyImage;
    };
}

export interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    description: string;
    productType: string;
    featuredImage: ShopifyImage;
    priceRange: {
        minVariantPrice: ShopifyMoney;
    };
    images: {
        edges: { node: ShopifyImage }[];
    };
    variants: {
        edges: { node: ShopifyProductVariant }[];
    };
}

export interface ShopifyProductEdge {
    node: ShopifyProduct;
}

export interface CartLineItem {
    id: string;
    quantity: number;
    attributes: { key: string; value: string }[];
    merchandise: ShopifyProductVariant;
}

export interface ShopifyCart {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    lines: {
        edges: { node: CartLineItem }[];
    };
}

export interface ShopifyError {
    message: string;
    locations?: { line: number; column: number }[];
    path?: string[];
    extensions?: Record<string, unknown>;
}

export interface ShopifyResponse<T> {
    data: T;
    errors?: ShopifyError[];
}

export interface UserError {
    field: string[];
    message: string;
}

export interface CartOperationResult {
    cart: ShopifyCart;
    userErrors: UserError[];
}
