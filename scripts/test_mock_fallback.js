const { getAllProducts } = require('../src/lib/shopify');

// Force verify fallback by corrupting env vars for this process
process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN = "";
process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN = "";

async function testFallback() {
    console.log('🧪 Testing Mock Fallback in getAllProducts...');
    try {
        const products = await getAllProducts();
        if (products.length > 0) {
            console.log(`✅ Success: Returned ${products.length} products (Mocks).`);
            console.log(`Sample: ${products[0].node.title}`);
        } else {
            console.error('❌ Failed: Returned 0 products.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testFallback();
