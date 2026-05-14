const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'lisascustomkeychains.myshopify.com';
const token = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN; // Storefront Token

const productId = "gid://shopify/Product/14976140837234";

const query = JSON.stringify({
    query: `query getProduct($id: ID!) {
        node(id: $id) {
            ... on Product {
                id
                title
                handle
                description
                availableForSale
            }
        }
    }`,
    variables: { id: productId }
});

const options = {
    hostname: domain,
    path: '/api/2026-04/graphql.json',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(data);
    });
});

req.write(query);
req.end();
