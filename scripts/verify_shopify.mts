
import fs from 'fs';
import path from 'path';
import https from 'https';

// Manual .env.local parsing since dotenv might not be available
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`📂 Loading .env from: ${envPath}`);
let env: Record<string, string> = {};
try {
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, '');
        env[key] = value;
      }
    });
    console.log("Keys found:", Object.keys(env));
  } else {
    console.error("❌ .env.local file not found at path!");
  }
} catch (e) {
  console.error("Could not read .env.local", e);
}

const shopifyStoreDomain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyAccessToken = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!shopifyStoreDomain || !shopifyAccessToken) {
  console.error("❌ Missing Shopify Credentials in .env.local");
  process.exit(1);
}

console.log(`🔍 Probing Shopify: ${shopifyStoreDomain}`);

const query = `
  query getProducts {
    products(first: 5) {
      edges {
        node {
          id
          title
          productType
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
      const json = JSON.parse(data);
      if (json.errors) {
        console.error("❌ Shopify API Errors:", JSON.stringify(json.errors, null, 2));
        process.exit(1);
      }
      const products = json.data?.products?.edges || [];
      console.log(`✅ Connection Successful! Found ${products.length} products.`);
      products.forEach((p: any) => {
        console.log(`   - [${p.node.productType}] ${p.node.title}`);
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
