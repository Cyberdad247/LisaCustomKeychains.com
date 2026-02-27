const fs = require('fs');

async function main() {
    try {
        console.log("Fetching live products from Shopify...");
        // Hack: load env if not present
        const path = require('path');
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf-8');
            envFile.split(/\r?\n/).forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const eq = trimmed.indexOf('=');
                if (eq > 0) {
                    process.env[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim().replace(/^['"]|['"]$/g, '');
                }
            });
        }

        // Import the compiled/transpiled lib if possible, but we are in JS.
        // Let's just use the GraphQL query directly here to be safe and simple.
        const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
        const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

        if (!domain || !token) {
            console.error("Missing Shopify credentials in environment.");
            return;
        }

        const query = `
          query getProducts {
            products(first: 250) {
              edges {
                node {
                  id
                  title
                  handle
                  productType
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch(`https://${domain}/api/2023-10/graphql.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Storefront-Access-Token': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        if (data.errors) {
            console.error("Shopify Errors:", JSON.stringify(data.errors, null, 2));
            return;
        }

        const products = data.data.products.edges;
        const list = products.map(p => ({
            Title: p.node.title,
            Type: p.node.productType,
            Price: `${p.node.priceRange.minVariantPrice.amount} ${p.node.priceRange.minVariantPrice.currencyCode}`,
            Handle: p.node.handle
        }));

        fs.writeFileSync(path.resolve(process.cwd(), 'tmp/products.json'), JSON.stringify(list, null, 2));
        console.log(`✅ Saved ${list.length} products to tmp/products.json`);

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

main();
