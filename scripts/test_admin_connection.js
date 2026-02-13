const fs = require('fs');
const path = require('path');
const https = require('https');

// Manual .env.local parsing
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
            const key = trimmed.substring(0, eq).trim();
            const value = trimmed.substring(eq + 1).trim().replace(/^['"]|['"]$/g, '');
            env[key] = value;
        }
    });
}

const rawDomain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const domain = rawDomain ? rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
const accessToken = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const apiKey = env.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY;
const apiSecret = env.SHOPIFY_API_SECRET || process.env.SHOPIFY_API_SECRET;

console.log(`🔍 Domain: ${domain}`);
console.log(`🔍 Token Prefix: ${accessToken ? accessToken.substring(0, 10) + '...' : 'N/A'}`);
console.log(`🔍 API Key Prefix: ${apiKey ? apiKey.substring(0, 6) + '...' : 'N/A'}`);
console.log(`🔍 API Secret Prefix: ${apiSecret ? apiSecret.substring(0, 6) + '...' : 'N/A'}`);

if (!domain) {
    console.error('❌ Missing Domain');
    process.exit(1);
}

const url = `https://${domain}/admin/api/2024-01/shop.json`;

function testAuth(name, headers) {
    return new Promise((resolve) => {
        const options = { method: 'GET', headers: headers };
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ [${name}] Success! Status: 200`);
                    resolve(true);
                } else if (res.statusCode === 401) {
                    console.log(`❌ [${name}] Failed (401 Unauthorized).`);
                    resolve(false);
                } else {
                    console.log(`⚠️ [${name}] Failed. Status: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        req.on('error', e => {
            console.error(`❌ [${name}] Error: ${e.message}`);
            resolve(false);
        });
        req.end();
    });
}

(async () => {
    let success = false;

    // 1. Header Auth
    if (accessToken) {
        if (await testAuth('Header: AccessToken', {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken
        })) success = true;
    }

    // 2. Basic Auth: Key + Secret
    if (apiKey && apiSecret) {
        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        if (await testAuth('Basic: Key+Secret', {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        })) success = true;
    }

    // 3. Basic Auth: Key + AccessToken (as password)
    if (apiKey && accessToken) {
        const auth = Buffer.from(`${apiKey}:${accessToken}`).toString('base64');
        if (await testAuth('Basic: Key+AccessToken', {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        })) success = true;
    }

    // 4. Basic Auth: AccessToken (as Key) + Secret (as Password)
    if (accessToken && apiSecret) {
        const auth = Buffer.from(`${accessToken}:${apiSecret}`).toString('base64');
        if (await testAuth('Basic: Token+Secret', {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        })) success = true;
    }

    if (!success) {
        console.error('\n❌ All authentication methods failed.');
        process.exit(1);
    } else {
        console.log('\n🎉 At least one method succeeded!');
    }

})();
