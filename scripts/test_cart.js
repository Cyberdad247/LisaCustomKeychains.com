#!/usr/bin/env node
/**
 * Cart Diagnostic - Tests createCart + addToCart via Storefront API
 */
const { domain, storefrontAccessToken: token, SHOPIFY_API_VERSION } = require('./camelot_utils');

console.log(`🔍 Domain: ${domain}`);
console.log(`🔑 Token: ${token ? token.substring(0, 6) + '...' : 'MISSING'}`);

const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

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

    console.log(`   HTTP Status: ${res.status}`);
    const raw = await res.text();
    let json;
    try {
        json = raw ? JSON.parse(raw) : {};
    } catch {
        throw new Error(`Non-JSON Shopify response (${res.status}): ${raw.slice(0, 200)}`);
    }
    if (!res.ok) {
        throw new Error(`Shopify request failed (${res.status}): ${JSON.stringify(json)}`);
    }
    if (json.errors) {
        console.error('   GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    }
    return json;
}

async function main() {
    // Step 1: Create Cart
    console.log('\n=== STEP 1: Create Cart ===');
    const createCartQuery = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
          totalQuantity
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const createResult = await shopifyFetch(createCartQuery);
    const cart = createResult.data?.cartCreate?.cart;
    const createErrors = createResult.data?.cartCreate?.userErrors;

    if (createErrors?.length) {
        console.error('   ❌ Cart Creation Errors:', createErrors);
        return;
    }

    if (!cart) {
        console.error('   ❌ Cart is null/undefined. Full response:');
        console.error(JSON.stringify(createResult, null, 2));
        return;
    }

    console.log(`   ✅ Cart Created: ${cart.id}`);
    console.log(`   Checkout URL: ${cart.checkoutUrl}`);

    // Step 2: Get a product variant to add
    console.log('\n=== STEP 2: Find a Product Variant ===');
    const productQuery = `
    query {
      products(first: 1) {
        edges {
          node {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

    const productResult = await shopifyFetch(productQuery);
    const product = productResult.data?.products?.edges?.[0]?.node;
    const variant = product?.variants?.edges?.[0]?.node;

    if (!variant) {
        console.error('   ❌ No variants found');
        return;
    }

    console.log(`   ✅ Product: ${product.title}`);
    console.log(`   Variant ID: ${variant.id}`);
    console.log(`   Available: ${variant.availableForSale}`);

    // Step 3: Add to Cart
    console.log('\n=== STEP 3: Add to Cart ===');
    const addToCartQuery = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const addResult = await shopifyFetch(addToCartQuery, {
        cartId: cart.id,
        lines: [{ merchandiseId: variant.id, quantity: 1 }]
    });

    const updatedCart = addResult.data?.cartLinesAdd?.cart;
    const addErrors = addResult.data?.cartLinesAdd?.userErrors;

    if (addErrors?.length) {
        console.error('   ❌ Add to Cart Errors:', addErrors);
        return;
    }

    if (!updatedCart) {
        console.error('   ❌ cartLinesAdd returned null. Full response:');
        console.error(JSON.stringify(addResult, null, 2));
        return;
    }

    console.log(`   ✅ Item Added! Total Qty: ${updatedCart.totalQuantity}`);
    console.log(`   Total: ${updatedCart.cost.totalAmount.amount} ${updatedCart.cost.totalAmount.currencyCode}`);
    console.log(`   Items in Cart:`);
    updatedCart.lines.edges.forEach((edge, i) => {
        console.log(`     ${i + 1}. ${edge.node.merchandise.product.title} x${edge.node.quantity}`);
    });

    console.log('\n✅ Cart Pipeline: FULLY OPERATIONAL');
}

main().catch(err => {
    console.error('\n❌ FATAL:', err);
    process.exitCode = 1;
});
