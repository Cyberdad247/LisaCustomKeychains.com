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

// Variant IDs from inspect_output.json (Handmade Heart) and assuming others
// Handmade Heart Variant: 61587685409138
// I need the Inventory Item ID to update inventory?
// Or I can update "variant" inventory_quantity (deprecated) or use inventoryAdjustQuantity?
// Simpler: Update Variant "inventory_management" to null (don't track) ?
// Or just set "inventory_policy: continue" (already set).

// If policy is continue, it should show even if 0.
// But let's verify.

const products = [
    { title: "Handmade Heart Earrings", id: 14976140837234 },
    { title: "Custom Charm Earrings", id: 14976140870002 },
    { title: "Boho Weave Earrings", id: 14976140902770 }
];

async function updateInventory(productId) {
    // 1. Get Product to find Inventory Item ID
    const productRes = await request(`/admin/api/2026-04/products/${productId}.json`);
    const variant = productRes.product.variants[0];
    const inventoryItemId = variant.inventory_item_id;
    const locationId = 320832012658; // Wait, I need a location ID.
    // Fetch locations first?
    const locRes = await request(`/admin/api/2026-04/locations.json`);
    const location = locRes.locations[0].id;

    console.log(`   📍 Location: ${location}, InventoryItem: ${inventoryItemId}`);

    // 2. Set Inventory
    const payload = {
        "location_id": location,
        "inventory_item_id": inventoryItemId,
        "available": 100
    };

    await request(`/admin/api/2026-04/inventory_levels/set.json`, 'POST', payload);
    console.log(`   ✅ Inventory set to 100 for ${productId}`);
}

function request(path, method = 'GET', data = null) {
    const options = {
        hostname: domain,
        path: path,
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
                else reject(body);
            });
        });
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async () => {
    try {
        for (const p of products) {
            console.log(`📦 Updating Inventory for ${p.title}...`);
            await updateInventory(p.id);
        }
    } catch (e) {
        console.error(e);
    }
})();
