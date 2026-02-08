
const fs = require('fs');
const path = require('path');
const https = require('https');

// Manual .env.local parsing
const envPath = path.resolve(process.cwd(), '.env.local');
console.log("Reading .env.local from:", envPath);
let env = {};
try {
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    // Split by newlines (CRLF or LF)
    const lines = envFile.split(/\r?\n/);
    console.log(`File read, ${lines.length} lines.`);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex > 0) {
        const key = trimmed.substring(0, equalsIndex).trim();
        let value = trimmed.substring(equalsIndex + 1).trim();
        // Remove quotes if present
        value = value.replace(/^['"]|['"]$/g, '');
        env[key] = value;
      }
    });
    console.log("Keys loaded:", Object.keys(env));
  } else {
    console.warn("File not found:", envPath);
  }
} catch (e) {
  console.error("Could not read .env.local", e);
}

const shopifyStoreDomain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
const shopifyAccessToken = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log("Domain found:", shopifyStoreDomain);
console.log("Token found:", shopifyAccessToken ? (shopifyAccessToken.substring(0, 5) + "...") : "MISSING");

if (!shopifyStoreDomain || !shopifyAccessToken) {
  console.error("❌ Missing Shopify Credentials in .env.local");
  process.exit(1);
}

console.log(`🔍 Probing Shopify: ${shopifyStoreDomain}`);

const query = `
  query getProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
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

const req = https.request(`https://${shopifyStoreDomain}/api/2023-10/graphql.json`, requestOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      if (res.statusCode !== 200) {
        console.error(`HTTP Error: ${res.statusCode}`);
        console.log("Response body:", data); // Log error body
        process.exit(1);
      }
      const json = JSON.parse(data);
      if (json.errors) {
        console.error("❌ Shopify API Errors:", JSON.stringify(json.errors, null, 2));
        process.exit(1);
      }
      const products = json.data?.products?.edges || [];
      console.log(`✅ Connection Successful! Found ${products.length} products.`);
      products.forEach((p) => {
        const price = p.node.priceRange?.minVariantPrice?.amount;
        const currency = p.node.priceRange?.minVariantPrice?.currencyCode;
        const imageCount = p.node.images?.edges?.length || 0;
        console.log(`   - [${p.node.productType}] ${p.node.title}`);
        console.log(`     ID: ${p.node.id}`);
        console.log(`     Handle: ${p.node.handle}`);
        console.log(`     Price: ${price} ${currency}`);
        console.log(`     Images: ${imageCount}`);
        p.node.images.edges.forEach(img => {
          console.log(`       - ${img.node.url}`);
        });
      });
      process.exit(0);
    } catch (e) {
      console.error("❌ Failed to parse response:", e);
      console.error("Response:", data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error("❌ Network Error:", e);
  process.exit(1);
});

req.write(JSON.stringify({ query }));
req.end();
