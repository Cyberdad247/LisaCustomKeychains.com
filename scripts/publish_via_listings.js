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

function request(apiPath, method = 'GET', data = null) {
    const options = {
        hostname: domain,
        path: apiPath,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(body));
                else reject(`Status ${res.statusCode}: ${body.substring(0, 500)}`);
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

const productIds = [14976140837234, 14976140870002, 14976140902770];

(async () => {
    // Step 1: Check existing product_listings
    console.log("=== Existing Product Listings ===");
    try {
        const listings = await request('/admin/api/2026-04/product_listings.json?limit=250');
        console.log(`Found ${listings.product_listings.length} product listings.`);
        const earringListings = listings.product_listings.filter(l => l.product_type === 'Earrings');
        console.log(`Earring listings: ${earringListings.length}`);
        earringListings.forEach(l => console.log(`  - ${l.title} (ID: ${l.product_id})`));
    } catch (e) {
        console.error(`Listings error: ${e}`);
    }

    // Step 2: Create product listings for new earrings
    console.log("\n=== Creating Product Listings ===");
    for (const pid of productIds) {
        try {
            console.log(`Publishing ${pid}...`);
            const res = await request(`/admin/api/2026-04/product_listings/${pid}.json`, 'PUT', {
                product_listing: { product_id: pid }
            });
            console.log(`  ✅ Listed: ${res.product_listing?.title || 'OK'}`);
        } catch (e) {
            console.error(`  ❌ Error for ${pid}: ${e}`);
        }
    }

    // Step 3: Verify
    console.log("\n=== Verification ===");
    try {
        const listings = await request('/admin/api/2026-04/product_listings.json?limit=250');
        const earringListings = listings.product_listings.filter(l => l.product_type === 'Earrings');
        console.log(`Total listings: ${listings.product_listings.length}`);
        console.log(`Earring listings: ${earringListings.length}`);
        earringListings.forEach(l => console.log(`  - ${l.title} (ID: ${l.product_id}, Price: ${l.variants?.[0]?.price})`));
    } catch (e) {
        console.error(`Verification error: ${e}`);
    }
})();
