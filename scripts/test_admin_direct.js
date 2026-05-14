const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        }
    });
}

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const adminToken = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

const options = {
    hostname: domain,
    path: '/admin/api/2026-04/shop.json',
    method: 'GET',
    headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const json = JSON.parse(data);
            console.log(`✅ Admin Success: ${json.shop.name}`);
        } else {
            console.log(`❌ Admin Failed: ${data}`);
        }
    });
});
req.on('error', e => console.error(e));
req.end();
