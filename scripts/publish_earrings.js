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
const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

const publicationId = "gid://shopify/Publication/319167267186"; // Online Store
// const publicationIdOnline = "gid://shopify/Publication/319167267186"; // Online Store (Optional)

const products = [
    "gid://shopify/Product/14976140837234",
    "gid://shopify/Product/14976140870002",
    "gid://shopify/Product/14976140902770"
];

async function publishProduct(productId) {
    const query = JSON.stringify({
        query: `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
            publishablePublish(id: $id, input: $input) {
                userErrors {
                    field
                    message
                }
                publishable {
                    availablePublicationCount
                    publicationCount
                }
            }
        }`,
        variables: {
            id: productId,
            input: [{
                publicationId: publicationId
            }]
        }
    });

    const options = {
        hostname: domain,
        path: '/admin/api/2026-04/graphql.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
            'Content-Length': query.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(`Status: ${res.statusCode} - ${data}`);
                }
            });
        });
        req.on('error', reject);
        req.write(query);
        req.end();
    });
}

(async () => {
    console.log(`🚀 Publishing ${products.length} products to channel ${publicationId}...`);
    for (const pid of products) {
        try {
            console.log(`   Processing ${pid}...`);
            const res = await publishProduct(pid);
            if (res.data?.publishablePublish?.userErrors?.length > 0) {
                console.error(`   ❌ Error: ${JSON.stringify(res.data.publishablePublish.userErrors)}`);
            } else {
                console.log(`   ✅ Published! Counts: ${JSON.stringify(res.data?.publishablePublish?.publishable)}`);
            }
        } catch (e) {
            console.error(`   ❌ Exception: ${e}`);
        }
    }
})();
