// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyPrice;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  featuredImage?: ShopifyImage;
  priceRange?: {
    minVariantPrice: ShopifyPrice;
  };
  images: {
    edges: {
      node: ShopifyImage;
    }[];
  };
  variants: {
    edges: {
      node: ShopifyVariant;
    }[];
  };
}

export interface ShopifyCollection {
  edges: {
    node: ShopifyProduct;
  }[];
}
