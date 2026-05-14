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

console.log(`🔍 Domain: ${domain}`);
console.log(`🔍 Token Length: ${accessToken ? accessToken.length : 0}`);
console.log(`🔍 Token Prefix: ${accessToken ? accessToken.substring(0, 6) : 'N/A'}`);

if (!domain || !accessToken) {
    console.error('❌ Missing Admin Credentials (SHOPIFY_ADMIN_API_ACCESS_TOKEN or NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN)');
    process.exit(1);
}

const API_VERSION = env.SHOPIFY_API_VERSION || process.env.SHOPIFY_API_VERSION || '2026-04';
const BASE_URL = `https://${domain}/admin/api/${API_VERSION}`;

const earrings = [
    {
        title: "Handmade Heart Earrings",
        description: "Authentic Lisa Custom Earrings. Handcrafted heart design.",
        imageName: "earrings_1.jpg",
        price: "15.00",
        sku: "EAR-HEART-001"
    },
    {
        title: "Custom Charm Earrings",
        description: "Authentic Lisa Custom Earrings. Personalize with your choice of charms.",
        imageName: "earrings_2.jpg",
        price: "15.00",
        sku: "EAR-CHARM-002"
    },
    {
        title: "Boho Weave Earrings",
        description: "Authentic Lisa Custom Earrings. Intricate woven pattern.",
        imageName: "earrings_3.jpg",
        price: "15.00",
        sku: "EAR-BOHO-003"
    }
];

async function checkProductExists(title) {
    const response = await makeRequest(`/products.json?title=${encodeURIComponent(title)}`, 'GET');
    return response.products.length > 0 ? response.products[0] : null;
}

async function createProduct(earring) {
    const existing = await checkProductExists(earring.title);
    if (existing) {
        console.log(`⚠️ Product "${earring.title}" already exists (ID: ${existing.id}). Skipping.`);
        return existing;
    }

    console.log(`📦 Creating Product "${earring.title}"...`);
    const imagePath = path.join(__dirname, `../public/images/${earring.imageName}`);

    if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️ Image not found at ${imagePath}. Creating without image.`);
    }

    const imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
    const imageBase64 = imageBuffer ? imageBuffer.toString('base64') : null;

    const productData = {
        product: {
            title: earring.title,
            body_html: `<strong>${earring.description}</strong>`,
            vendor: "LisaCustomKeychains",
            product_type: "Earrings",
            tags: "Earrings, Handmade, Jewelry",
            variants: [
                {
                    price: earring.price,
                    sku: earring.sku,
                    inventory_management: "shopify",
                    inventory_policy: "continue" // Overselling allowed as per brand request
                }
            ],
            images: imageBase64 ? [
                {
                    attachment: imageBase64,
                    filename: earring.imageName
                }
            ] : []
        }
    };

    const product = await makeRequest('/products.json', 'POST', productData);
    console.log(`✅ Product Created: ${product.product.title} (ID: ${product.product.id})`);
    return product.product;
}

async function createCollection() {
    console.log('📂 Checking Smart Collection "Earrings"...');

    // check if exists first
    const existing = await makeRequest('/smart_collections.json?title=Earrings', 'GET');
    if (existing.smart_collections.length > 0) {
        console.log(`✅ Collection "Earrings" already exists (ID: ${existing.smart_collections[0].id}).`);
        return existing.smart_collections[0];
    }

    const collectionData = {
        smart_collection: {
            title: "Earrings",
            rules: [
                {
                    column: "type",
                    relation: "equals",
                    condition: "Earrings"
                }
            ]
        }
    };

    const collection = await makeRequest('/smart_collections.json', 'POST', collectionData);
    console.log(`✅ Collection Created: ${collection.smart_collection.title} (ID: ${collection.smart_collection.id})`);
    return collection.smart_collection;
}

function makeRequest(endpoint, method, data) {
    const apiKey = env.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY;
    const apiSecret = env.SHOPIFY_API_SECRET || process.env.SHOPIFY_API_SECRET;

    // Retry Logic with Different Auth Strategies
    async function executeRequest(strategies) {
        for (const strategy of strategies) {
            try {
                return await new Promise((resolve, reject) => {
                    const options = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            ...strategy.headers
                        }
                    };

                    if (strategy.name === 'Basic Auth' && !strategy.headers.Authorization) {
                        // Skip if missing credentials
                        reject(new Error('Missing Basic Auth Credentials'));
                        return;
                    }

                    console.log(`📡 Requesting via ${strategy.name}: ${BASE_URL}${endpoint}`);
                    const req = https.request(`${BASE_URL}${endpoint}`, options, (res) => {
                        let body = '';
                        res.on('data', chunk => body += chunk);
                        res.on('end', () => {
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                try {
                                    resolve(JSON.parse(body));
                                } catch (e) {
                                    reject(e);
                                }
                            } else {
                                reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
                            }
                        });
                    });

                    req.on('error', (e) => reject(e));
                    if (data) req.write(JSON.stringify(data));
                    req.end();
                });
            } catch (e) {
                console.warn(`⚠️ ${strategy.name} failed: ${e.message}`);
                // Continue to next strategy
            }
        }
        throw new Error('All authentication strategies failed. Please check .env.local for SHOPIFY_ADMIN_API_ACCESS_TOKEN or SHOPIFY_API_KEY/SECRET.');
    }

    const strategies = [];
    if (accessToken) strategies.push({ name: 'Header Auth', headers: { 'X-Shopify-Access-Token': accessToken } });
    if (apiKey && apiSecret) {
        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        strategies.push({ name: 'Basic Auth (Key:Secret)', headers: { 'Authorization': `Basic ${auth}` } });
    }
    // Fallback: Try AccessToken as Key? 
    if (accessToken && apiSecret) {
        const auth = Buffer.from(`${accessToken}:${apiSecret}`).toString('base64');
        strategies.push({ name: 'Basic Auth (Token:Secret)', headers: { 'Authorization': `Basic ${auth}` } });
    }

    return executeRequest(strategies);

}

(async () => {
    try {
        for (const earring of earrings) {
            await createProduct(earring);
        }
        await createCollection();
        console.log('🎉 Done! Earrings Sync Complete.');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
