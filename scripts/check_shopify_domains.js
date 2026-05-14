const https = require('https');
const { domain: storeDomain, adminAccessToken: accessToken, SHOPIFY_API_VERSION } = require('./camelot_utils');

if (!accessToken) {
    console.error('Missing SHOPIFY_ADMIN_API_ACCESS_TOKEN.');
    process.exit(1);
}

console.log(`🔎 Checking Shop Domain Settings: ${storeDomain}`);

const options = {
    hostname: storeDomain,
    path: `/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            if (res.statusCode === 200) {
                const json = JSON.parse(data);
                const shop = json.shop;
                console.log(`✅ Connection Successful!`);
                console.log(`--------------------------------------------------`);
                console.log(`🏠 Shop Name:       ${shop.name}`);
                console.log(`📧 Email:           ${shop.email}`);
                console.log(`🌐 Primary Domain:  ${shop.domain}`);
                console.log(`🔗 Myshopify:       ${shop.myshopify_domain}`);
                console.log(`🔐 Password Prot:   ${shop.password_enabled ? 'ENABLED 🔒' : 'DISABLED 🔓'}`);
                console.log(`--------------------------------------------------`);
            } else {
                console.error(`❌ API Request Failed (Status: ${res.statusCode})`);
                console.error('Response:', data);
            }
        } catch (e) {
            console.error('❌ Failed to parse response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Network Error:', e);
});

req.end();
