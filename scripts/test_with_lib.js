const { shopifyApi, LATEST_API_VERSION, Session } = require('@shopify/shopify-api');
const fs = require('fs');
const path = require('path');
require('@shopify/shopify-api/adapters/node');

// Manual .env.local because dotenv might not be installed globally or in devDependencies for script usage
const envPath = path.resolve(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            if (key && !key.startsWith('#')) env[key] = value;
        }
    });
}

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ? env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
const accessToken = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const apiKey = env.SHOPIFY_API_KEY;
const apiSecret = env.SHOPIFY_API_SECRET;

console.log('Testing with @shopify/shopify-api...');
console.log(`Domain: ${domain}`);
console.log(`Token Prefix: ${accessToken ? accessToken.substring(0, 10) + '...' : 'N/A'}`);

if (!domain || !accessToken) {
    console.error('Missing domain or access token');
    process.exit(1);
}

try {
    const shopify = shopifyApi({
        apiKey: apiKey || 'test_key',
        apiSecretKey: apiSecret || 'test_secret',
        scopes: ['read_products'],
        hostName: domain,
        apiVersion: LATEST_API_VERSION,
        isEmbeddedApp: false,
    });

    const session = new Session({
        id: 'offline_' + domain,
        shop: domain,
        state: 'state',
        isOnline: false,
        accessToken: accessToken,
    });

    const client = new shopify.clients.Rest({ session });

    (async () => {
        try {
            const data = await client.get({
                path: 'shop',
            });
            console.log('✅ Connection Successful!');
            console.log('Shop Name:', data.body.shop.name);
        } catch (error) {
            console.error('❌ Connection Failed:', error.message);
            if (error.response) {
                console.error('Status:', error.response.code);
                console.error('Errors:', JSON.stringify(error.response.statusText, null, 2));
            }
        }
    })();
} catch (e) {
    console.error('Setup Error:', e.message);
}
