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

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

// All publications from pubs.json
const allPublications = [
    "gid://shopify/Publication/319167299954",  // Point of Sale
    "gid://shopify/Publication/319167267186",  // Online Store
    "gid://shopify/Publication/319760564594",  // Google & YouTube
    "gid://shopify/Publication/319760597362",  // Google & YouTube
    "gid://shopify/Publication/319760630130",  // Google & YouTube
    "gid://shopify/Publication/320832012658",  // Pinterest
    "gid://shopify/Publication/319167365490",  // Shop
    "gid://shopify/Publication/319167332722",  // Point of Sale
    "gid://shopify/Publication/319759679858",  // TikTok Shop
    "gid://shopify/Publication/319759712626",  // TikTok Shop 
    "gid://shopify/Publication/319410700658",  // Lisa's Custom Keychains
];

const products = [
    "gid://shopify/Product/14976140837234",
    "gid://shopify/Product/14976140870002",
    "gid://shopify/Product/14976140902770"
];

function request(queryStr) {
    const options = {
        hostname: domain,
        path: '/admin/api/2026-04/graphql.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(data));
                else reject(`${res.statusCode}: ${data}`);
            });
        });
        req.on('error', reject);
        req.write(queryStr);
        req.end();
    });
}

async function publishToAll(productId) {
    const inputs = allPublications.map(pub => ({ publicationId: pub }));
    const query = JSON.stringify({
        query: `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
            publishablePublish(id: $id, input: $input) {
                userErrors { field message }
                publishable { availablePublicationCount publicationCount }
            }
        }`,
        variables: { id: productId, input: inputs }
    });
    return request(query);
}

(async () => {
    console.log(`🚀 Publishing ${products.length} products to ALL ${allPublications.length} channels...`);
    for (const pid of products) {
        try {
            console.log(`\n📦 ${pid}`);
            const res = await publishToAll(pid);
            const errors = res.data?.publishablePublish?.userErrors || [];
            const pub = res.data?.publishablePublish?.publishable;
            if (errors.length > 0) {
                errors.forEach(e => console.log(`   ⚠️ ${e.field}: ${e.message}`));
            }
            console.log(`   ✅ Available: ${pub?.availablePublicationCount}, Published: ${pub?.publicationCount}`);
        } catch (e) {
            console.error(`   ❌ ${e}`);
        }
    }
    console.log('\n✅ Done.');
})();
