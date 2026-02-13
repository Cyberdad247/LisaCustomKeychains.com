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
const productId = '14976140837234'; // Handmade Heart Earrings

if (!token) {
    console.error("❌ No Admin Token");
    process.exit(1);
}

const options = {
    hostname: domain,
    path: `/admin/api/2023-10/products/${productId}.json`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } else {
            console.error(`Status: ${res.statusCode}`);
            console.error(data);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
