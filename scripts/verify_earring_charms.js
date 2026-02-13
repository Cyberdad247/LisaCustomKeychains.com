const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});

const domain = envVars.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || envVars.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
const token = envVars.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log(`🔍 Domain: ${domain}`);
console.log(`🔑 Token: ${token ? token.substring(0, 6) + '...' : 'MISSING'}`);

const endpoint = `https://${domain}/api/2023-10/graphql.json`;

async function shopifyFetch(query, variables = {}) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'X-Shopify-Storefront-Access-Token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();
    if (json.errors) {
        console.error('   GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    }
    return json;
}

async function main() {
    console.log('\n=== STEP 1: Create Cart ===');
    const createCartQuery = `mutation cartCreate { cartCreate { cart { id checkoutUrl } } }`;
    const createResult = await shopifyFetch(createCartQuery);
    const cart = createResult.data?.cartCreate?.cart;
    if (!cart) return console.error('Failed to create cart');
    console.log(`   ✅ Cart Created: ${cart.id}`);

    console.log('\n=== STEP 2: Find Earring Product ===');
    const productQuery = `
    query {
      products(first: 20, query: "earring") {
        edges {
          node {
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  `;
    const productResult = await shopifyFetch(productQuery);
    const productEdge = productResult.data?.products?.edges?.[0];

    if (!productEdge) {
        console.error("❌ No 'earring' product found. Cannot verify charms.");
        return;
    }

    const product = productEdge.node;
    const variantId = product.variants.edges[0].node.id;
    console.log(`   ✅ Found Product: ${product.title}`);
    console.log(`   ✅ Variant ID: ${variantId}`);

    console.log('\n=== STEP 3: Add Earring with Charms ===');
    const addToCartQuery = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 10) {
            edges {
              node {
                quantity
                merchandise { ... on ProductVariant { title } }
                attributes { key value }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

    const attributes = [
        { key: "Text", value: "TEST" },
        { key: "Color", value: "Royal Purple" },
        { key: "Top Charm", value: "Star ⭐" },
        { key: "Bottom Charm", value: "Heart ❤️" }
    ];

    const addResult = await shopifyFetch(addToCartQuery, {
        cartId: cart.id,
        lines: [{
            merchandiseId: variantId,
            quantity: 1,
            attributes: attributes
        }]
    });

    const updatedCart = addResult.data?.cartLinesAdd?.cart;
    const errors = addResult.data?.cartLinesAdd?.userErrors;

    if (errors?.length) {
        console.error('❌ Errors adding to cart:', errors);
        return;
    }

    const lineItem = updatedCart.lines.edges.find(e => e.node.merchandise.title);
    if (!lineItem) {
        console.error('❌ No line items found in cart');
        return;
    }

    console.log('   ✅ Item Added to Cart');
    console.log('   🔍 Verifying Attributes:');

    const cartAttrs = lineItem.node.attributes;
    const hasTop = cartAttrs.some(a => a.key === "Top Charm" && a.value === "Star ⭐");
    const hasBottom = cartAttrs.some(a => a.key === "Bottom Charm" && a.value === "Heart ❤️");

    cartAttrs.forEach(a => console.log(`      - ${a.key}: ${a.value}`));

    if (hasTop && hasBottom) {
        console.log('\n✨ SUCCESS: Shopify Cart API correctly accepted Charm attributes!');
    } else {
        console.error('\n❌ FAILURE: Attributes missing or incorrect.');
    }
}

main().catch(console.error);
