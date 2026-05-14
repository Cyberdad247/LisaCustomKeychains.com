const fs = require('fs');
const path = require('path');

// Load env vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, '');
        }
    });
} catch (e) {
    console.warn('Could not read .env.local');
}

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
    console.error('Missing Shopify credentials in .env.local');
    process.exit(1);
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
          featuredImage {
            url
            altText
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchProducts() {
    console.log(`Connecting to ${domain}...`);
    try {
        const res = await fetch(`https://${domain}/api/2026-04/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': token
            },
            body: JSON.stringify({ query })
        });

        const body = await res.json();
        if (body.errors) {
            console.error('GraphQL Errors:', body.errors);
            return;
        }

        const products = body.data.products.edges;
        const earrings = products.filter(p =>
            p.node.productType === 'Earrings' ||
            p.node.title.toLowerCase().includes('earring')
        );

        console.log(`\nFound ${earrings.length} Earring Products. Writing to inspect_output.json...`);

        const output = {
            timestamp: new Date().toISOString(),
            count: earrings.length,
            products: earrings.map(p => ({
                id: p.node.id,
                title: p.node.title,
                handle: p.node.handle,
                hasFeaturedImage: !!p.node.featuredImage,
                featuredImageUrl: p.node.featuredImage ? p.node.featuredImage.url : null,
                hasImages: p.node.images.edges.length > 0
            }))
        };

        fs.writeFileSync('inspect_output.json', JSON.stringify(output, null, 2));
        console.log('✅ Done.');

    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

fetchProducts();
