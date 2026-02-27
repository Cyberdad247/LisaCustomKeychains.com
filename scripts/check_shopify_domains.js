const https = require('https');

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'lisascustomkeychains.myshopify.com';
const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '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';

console.log(`🔎 Checking Shop Domain Settings: ${storeDomain}`);

const options = {
    hostname: storeDomain,
    path: '/admin/api/2023-10/shop.json',
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
