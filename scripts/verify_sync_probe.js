const https = require('https');
const fs = require('fs');
const path = require('path');

// --- Load Env ---
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

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'lisascustomkeychains.myshopify.com';
const token = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!token) {
    console.error('❌ Error: Token missing.');
    process.exit(1);
}

const query = JSON.stringify({
    query: `{
    products(first: 1) {
      edges {
        node {
          id
          title
        }
      }
    }
  }`
});

const options = {
    hostname: domain,
    path: '/api/2026-04/graphql.json',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode === 200) {
            const json = JSON.parse(data);
            const liveTitle = json.data.products.edges[0].node.title;
            const liveId = json.data.products.edges[0].node.id;

            console.log(`Live Top Product: ${liveTitle} (${liveId})`);

            // Now read the mocks file
            const mocksPath = path.join(process.cwd(), 'src/lib/shopify/mocks.ts');
            const mocksContent = fs.readFileSync(mocksPath, 'utf8');

            if (mocksContent.includes(liveId)) {
                console.log('✅ VERIFIED: Local mocks contain the live Shopify product ID.');
            } else {
                console.log('❌ MISMATCH: Local mocks do not match live Shopify data.');
            }
        } else {
            console.error(`Status: ${res.statusCode}`);
        }
    });
});
req.write(query);
req.end();
