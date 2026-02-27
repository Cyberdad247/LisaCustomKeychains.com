const https = require('https');

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'jgvme0-av.myshopify.com';
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log(`🔌 Testing connection to: ${domain}`);

if (!token) {
    console.error('❌ Error: NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing.');
    console.log('   Please set the token in your environment or pass it as a variable.');
    process.exit(1);
}

const query = JSON.stringify({
    query: `{
    shop {
      name
      primaryDomain {
        url
      }
    }
  }`
});

const options = {
    hostname: domain,
    path: '/api/2023-10/graphql.json',
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
            try {
                const json = JSON.parse(data);
                if (json.errors) {
                    console.error('❌ API Error:', JSON.stringify(json.errors, null, 2));
                } else {
                    console.log('✅ Connection Successful!');
                    console.log(`   Shop Name: ${json.data.shop.name}`);
                    console.log(`   Primary Domain: ${json.data.shop.primaryDomain.url}`);
                }
            } catch (e) {
                console.error('❌ Failed to parse response:', data);
            }
        } else {
            console.error(`❌ Connection Failed (Status: ${res.statusCode})`);
            console.error('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Network Error:', e);
});

req.write(query);
req.end();
