const https = require('https');

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const apiKey = process.env.SHOPIFY_API_KEY;

if (!domain || !accessToken) {
    console.error('Missing credentials');
    process.exit(1);
}

const API_VERSION = '2024-01';

function testAuth(name, headers, auth) {
    return new Promise((resolve) => {
        const options = {
            hostname: domain,
            path: `/admin/api/${API_VERSION}/shop.json`,
            method: 'GET',
            headers: headers,
            auth: auth
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                console.log(`[${name}] Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log(`✅ ${name} check passed!`);
                    resolve(true);
                } else {
                    console.log(`❌ ${name} failed: ${body.substring(0, 100)}...`);
                    resolve(false);
                }
            });
        });
        req.on('error', (e) => {
            console.log(`[${name}] Error: ${e.message}`);
            resolve(false);
        });
        req.end();
    });
}

(async () => {
    console.log('Testing Header Auth (X-Shopify-Access-Token)...');
    const headerSuccess = await testAuth('Header', {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
    });

    if (headerSuccess) return;

    if (apiKey) {
        console.log('Testing Basic Auth (API Key + Access Token)...');
        const basicSuccess = await testAuth('Basic', {
            'Content-Type': 'application/json'
        }, `${apiKey}:${accessToken}`);

        if (basicSuccess) return;
    }

    console.log('All auth methods failed.');
})();
