const https = require('https');

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'lisascustomkeychains.myshopify.com';
const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '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';

console.log(`🔎 Fetching ALL Domains for: ${storeDomain}`);

// Try to hit the Shop API, but really we want to see if we can get domain info.
// Note: 'shop.json' only gives the primary. We'll try to use the un-documented (or scope-restricted) domains endpoint if possible,
// or just re-inspect shop.json carefully.

const options = {
    hostname: storeDomain,
    path: '/admin/api/2023-10/domains.json', // Trying explicit domains endpoint
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
                console.log(`✅ Connection Successful!`);
                console.log(`--------------------------------------------------`);

                if (json.domains) {
                    console.log(`Found ${json.domains.length} domains:`);
                    json.domains.forEach(d => {
                        console.log(`   - ${d.url} (Primary: ${d.primary ? 'YES' : 'NO'}, Verified: ${d.ssl_enabled ? 'YES' : 'NO'})`);
                    });
                } else {
                    console.log("No specific 'domains' array found. (Might lack scope).");
                }
                console.log(`--------------------------------------------------`);
            } else {
                console.error(`❌ API Request Failed (Status: ${res.statusCode})`);
                console.error('Response:', data);
                console.log("\n(This likely means we cannot list secondary domains via API with current token scopes.)");
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
