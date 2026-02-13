const fs = require('fs');
const path = require('path');

// 1. Load Env (Gracefully)
const env = {};
const envPath = path.resolve(process.cwd(), '.env.local');
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

// 2. Validate Config
const rawDomain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const domain = rawDomain ? rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
const accessToken = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

if (!domain || !accessToken) {
    console.error('❌ Missing Shopify configuration:');
    if (!domain) console.error('   - NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is undefined');
    if (!accessToken) console.error('   - SHOPIFY_ADMIN_API_ACCESS_TOKEN is undefined');
    process.exit(1);
}

const API_VERSION = '2024-01';
const BASE_URL = `https://${domain}/admin/api/${API_VERSION}`;
const HEADERS = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken
};

// 3. Products Data (Configuration)
const PRODUCTS_TO_SYNC = [
    {
        title: "Handmade Heart Earrings",
        description: "Authentic Lisa Custom Earrings. Handcrafted heart design.",
        imageName: "earrings_1.jpg",
        price: "15.00",
        sku: "EAR-HEART-001",
        type: "Earrings",
        tags: "Earrings, Handmade, Jewelry"
    },
    {
        title: "Custom Charm Earrings",
        description: "Authentic Lisa Custom Earrings. Personalize with your choice of charms.",
        imageName: "earrings_2.jpg",
        price: "15.00",
        sku: "EAR-CHARM-002",
        type: "Earrings",
        tags: "Earrings, Customizable, Jewelry"
    },
    {
        title: "Boho Weave Earrings",
        description: "Authentic Lisa Custom Earrings. Intricate woven pattern.",
        imageName: "earrings_3.jpg",
        price: "15.00",
        sku: "EAR-BOHO-003",
        type: "Earrings",
        tags: "Earrings, Boho, Jewelry"
    }
];

const COLLECTION_NAME = "Earrings";

// 4. Helper Functions
async function shopifyRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: HEADERS,
        };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${BASE_URL}${endpoint}`, options);

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API Error (${res.status}): ${errorText}`);
        }

        return await res.json();
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}

async function findProductByTitle(title) {
    // Note: title search in REST API requires precise query or loop. 
    // Using filtered GET products.json matches partials usually.
    // But safely we can filter results.
    try {
        const data = await shopifyRequest(`/products.json?title=${encodeURIComponent(title)}&limit=10`);
        const match = data.products.find(p => p.title === title);
        return match || null;
    } catch (e) {
        console.warn(`Warning: findProductByTitle failed for ${title}, assuming not found. ${e.message}`);
        return null;
    }
}

async function findCollectionByTitle(title) {
    try {
        const data = await shopifyRequest(`/smart_collections.json?title=${encodeURIComponent(title)}&limit=10`);
        const match = data.smart_collections.find(c => c.title === title);
        return match || null;
    } catch (e) {
        console.warn(`Warning: findCollectionByTitle failed for ${title}, assuming not found. ${e.message}`);
        return null;
    }
}

function getBase64Image(imageName) {
    const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
    if (fs.existsSync(imagePath)) {
        return fs.readFileSync(imagePath).toString('base64');
    }
    // console.warn(`   ⚠️ Image not found: ${imageName}`); // Optional warn
    return null;
}

// 5. Main Sync Logic
async function sync() {
    // Pre-flight: Credential Verification (Titanium Law)
    console.log(`🔐 Verifying credentials (Titanium Law Check)...`);
    try {
        const shopData = await shopifyRequest('/shop.json');
        if (!shopData.shop) throw new Error("Invalid Shop Data");
        console.log(`   ✅ Authorized: ${shopData.shop.name} (${shopData.shop.domain})`);
    } catch (e) {
        console.error(`   ⛔ CRITICAL: Authentication Failed. Aborting Sync.`);
        console.error(`   Reason: ${e.message}`);
        process.exit(1);
    }

    console.log(`🔄 Starting Sync for store: ${domain}`);
    console.log(`   (Using Native Fetch & Admin Token)`);

    // A. Sync Products
    for (const item of PRODUCTS_TO_SYNC) {
        try {
            const existing = await findProductByTitle(item.title);
            const imageBase64 = getBase64Image(item.imageName);

            const productData = {
                product: {
                    title: item.title,
                    body_html: `<strong>${item.description}</strong>`,
                    vendor: "LisaCustomKeychains",
                    product_type: item.type,
                    status: "active",
                    published_scope: "global",
                    tags: item.tags,
                    variants: [{
                        price: item.price,
                        sku: item.sku,
                        inventory_management: "shopify",
                        inventory_policy: "continue"
                    }],
                    images: imageBase64 ? [{ attachment: imageBase64, filename: item.imageName }] : []
                }
            };

            if (existing) {
                console.log(`   🔄 Updating: ${item.title} (ID: ${existing.id})...`);
                // Use the IDs from the existing product to update variants/images correctly if needed
                // For simplicity, we'll just update the main product fields and let Shopify handle variants.
                // Note: Updating variants usually requires passing variant IDs. 
                // A simpler approach for this script is to just update the product attributes and the first variant.

                // Fetch full product to get variant IDs
                const fullProduct = await shopifyRequest(`/products/${existing.id}.json`);
                const variantId = fullProduct.product.variants[0]?.id;

                if (variantId) {
                    productData.product.variants[0].id = variantId;
                }

                const response = await shopifyRequest(`/products/${existing.id}.json`, 'PUT', productData);
                console.log(`   ✅ Updated: ${response.product.title}`);
            } else {
                console.log(`   📦 Creating: ${item.title}...`);
                const response = await shopifyRequest('/products.json', 'POST', productData);
                console.log(`   🎉 Created: ${response.product.title} (ID: ${response.product.id})`);
            }

        } catch (err) {
            console.error(`   ❌ Failed to sync product "${item.title}": ${err.message}`);
        }
    }

    // B. Sync Collection
    try {
        const existingColl = await findCollectionByTitle(COLLECTION_NAME);
        if (existingColl) {
            console.log(`   ✅ Collection Exists: ${COLLECTION_NAME} (ID: ${existingColl.id})`);
        } else {
            console.log(`   📂 Creating Collection: ${COLLECTION_NAME}...`);
            const collectionPayload = {
                smart_collection: {
                    title: COLLECTION_NAME,
                    rules: [{ column: "type", relation: "equals", condition: "Earrings" }]
                }
            };

            const response = await shopifyRequest('/smart_collections.json', 'POST', collectionPayload);
            console.log(`   🎉 Created Collection: ${response.smart_collection.title}`);
        }
    } catch (err) {
        console.error(`   ❌ Failed to sync collection: ${err.message}`);
    }

    // C. Register products with Storefront API via product_listings
    // This is CRITICAL: without this, products are Admin-only and invisible to Storefront token
    console.log(`\n🔗 Registering products with Storefront API (product_listings)...`);
    for (const item of PRODUCTS_TO_SYNC) {
        try {
            const existing = await findProductByTitle(item.title);
            if (existing) {
                await shopifyRequest(`/product_listings/${existing.id}.json`, 'PUT', {
                    product_listing: { product_id: existing.id }
                });
                console.log(`   ✅ Listed: ${item.title} (ID: ${existing.id})`);
            }
        } catch (err) {
            // 422 = already listed, which is fine
            if (err.message && err.message.includes('422')) {
                console.log(`   ℹ️ Already listed: ${item.title}`);
            } else {
                console.error(`   ⚠️ Listing failed for "${item.title}": ${err.message}`);
            }
        }
    }

    console.log('✅ Sync Workflow Complete.');
}

// Run
sync();
