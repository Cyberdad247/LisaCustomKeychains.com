const https = require('https');

const url = "https://cdn.shopify.com/s/files/1/0952/7151/8578/files/earrings_1.jpg?v=1770874129";

console.log(`Checking URL: ${url}`);

https.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content Type: ${res.headers['content-type']}`);
    console.log(`Content Length: ${res.headers['content-length']}`);

    if (res.statusCode === 200) {
        console.log('✅ Image URL is accessible.');
    } else {
        console.log('❌ Image URL is NOT accessible.');
    }
}).on('error', (e) => {
    console.error('❌ Error checking URL:', e);
});
