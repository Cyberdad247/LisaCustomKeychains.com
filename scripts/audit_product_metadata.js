const { mockProducts } = require('./src/lib/shopify/mocks');

console.log('--- Static Audit of local mocks.ts ---');
let issues = 0;
mockProducts.forEach((edge, index) => {
    const product = edge.node;
    if (!product.id) { console.log(`[!] Item ${index}: Missing ID`); issues++; }
    if (!product.handle) { console.log(`[!] Item ${index}: Missing Handle`); issues++; }
    if (!product.featuredImage || !product.featuredImage.url) {
        console.log(`[!] Item ${index} (${product.title}): Missing Featured Image`);
        issues++;
    }
});

if (issues === 0) {
    console.log('✅ All 20 products in mockProducts have valid IDs, Handles, and Featured Images.');
} else {
    console.log(`❌ Found ${issues} issues in product metadata.`);
}
