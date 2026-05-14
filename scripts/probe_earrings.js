const fs = require('fs');
const path = require('path');
const https = require('https');

// Manual .env.local parsing (reused logic)
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex > 0) {
            const key = trimmed.substring(0, equalsIndex).trim();
            let value = trimmed.substring(equalsIndex + 1).trim();
            value = value.replace(/^['"]|['"]$/g, '');
            env[key] = value;
        }
    });
}

const shopifyStoreDomain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
const shopifyAccessToken = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!shopifyStoreDomain || !shopifyAccessToken) {
    console.error("❌ Missing Credentials");
    process.exit(1);
}

const query = `
  query searchEarrings {
    products(first: 10, query: "product_type:earrings OR title:earrings") {
      edges {
        node {
          id
          title
          handle
          productType
        }
      }
    }
    collections(first: 10, query: "title:earrings") {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

const requestOptions = {
    method: "POST",
    headers: {
        "X-Shopify-Storefront-Access-Token": shopifyAccessToken,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
};

const req = https.request(`https://${shopifyStoreDomain}/api/2026-04/graphql.json`, requestOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        console.log("--- Products Found ---");
        json.data?.products?.edges?.forEach(e => console.log(`[${e.node.productType}] ${e.node.title} (${e.node.id})`));
        if (json.data?.products?.edges?.length === 0) console.log("No products found.");

        console.log("\n--- Collections Found ---");
        json.data?.collections?.edges?.forEach(e => console.log(`[Collection] ${e.node.title} (${e.node.id})`));
        if (json.data?.collections?.edges?.length === 0) console.log("No collections found.");
    });
});

req.end();
