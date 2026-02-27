const https = require('https');

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'lisascustomkeychains.myshopify.com';
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '4e309ac1ccdf8bf063d75bc15940a4cc';

console.log(`🔎 Check Prices on: ${domain}`);

const query = JSON.stringify({
    query: `{
    products(first: 10) {
      edges {
        node {
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 5) {
            edges {
              node {
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
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
        try {
            const json = JSON.parse(data);
            if (json.errors) {
                console.error('❌ API Error:', JSON.stringify(json.errors, null, 2));
            } else {
                console.log('✅ Product Prices:');
                json.data.products.edges.forEach(({ node }) => {
                    console.log(`\n📦 ${node.title} (${node.handle})`);
                    console.log(`   Range: ${node.priceRange.minVariantPrice.amount} ${node.priceRange.minVariantPrice.currencyCode}`);
                    node.variants.edges.forEach(({ node: variant }) => {
                        console.log(`   - ${variant.title}: ${variant.price.amount} ${variant.price.currencyCode}`);
                    });
                });
            }
        } catch (e) {
            console.error('❌ Failed to parse:', e);
        }
    });
});

req.write(query);
req.end();
