const https = require('https');
const { domain: STORE_DOMAIN, adminAccessToken: ADMIN_TOKEN, SHOPIFY_API_VERSION: API_VERSION } = require('./camelot_utils');

if (!ADMIN_TOKEN) {
  console.error('Missing SHOPIFY_ADMIN_API_ACCESS_TOKEN.');
  process.exit(1);
}

function shopifyRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: STORE_DOMAIN,
      path: `/admin/api/${API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errors) reject(json.errors);
          else resolve(json.data);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
}

async function getAllVariants() {
  let hasNextPage = true;
  let cursor = null;
  const allVariants = [];

  console.log("📦 Fetching all variants...");

  while (hasNextPage) {
    const query = "\n      query getVariants($cursor: String) {\n        products(first: 50, after: $cursor) {\n          pageInfo {\n            hasNextPage\n            endCursor\n          }\n          edges {\n            node {\n              id\n              title\n              variants(first: 50) {\n                edges {\n                  node {\n                    id\n                    title\n                    inventoryPolicy\n                    inventoryQuantity\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ";

    const data = await shopifyRequest(query, { cursor });
    
    data.products.edges.forEach(p => {
      p.node.variants.edges.forEach(v => {
        allVariants.push({
          id: v.node.id,
          title: `${p.node.title} - ${v.node.title}`,
          inventoryPolicy: v.node.inventoryPolicy,
          inventoryQuantity: v.node.inventoryQuantity
        });
      });
    });

    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return allVariants;
}

async function updateVariantPolicy(variantId) {
  const mutation = "\n    mutation updateVariant($input: ProductVariantInput!) {\n      productVariantUpdate(input: $input) {\n        productVariant {\n          id\n          inventoryPolicy\n        }\n        userErrors {\n          field\n          message\n        }\n      }\n    }\n  ";

  const result = await shopifyRequest(mutation, {
    input: {
      id: variantId,
      inventoryPolicy: "CONTINUE"
    }
  });

  if (result.productVariantUpdate.userErrors.length > 0) {
    throw new Error(result.productVariantUpdate.userErrors[0].message);
  }

  return result.productVariantUpdate.productVariant;
}

async function main() {
  try {
    const variants = await getAllVariants();
    console.log(`✅ Found ${variants.length} variants.`);

    const toUpdate = variants.filter(v => v.inventoryPolicy !== "CONTINUE");
    console.log(`📋 ${toUpdate.length} variants require update.`);

    for (const variant of toUpdate) {
      process.stdout.write(`🔄 Updating ${variant.title}... `);
      await updateVariantPolicy(variant.id);
      console.log("Done.");
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 200)); 
    }

    console.log("\n🎉 All products updated to 'Continue selling when out of stock'.");

  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

main();
