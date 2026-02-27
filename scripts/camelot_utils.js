/**
 * 🏰 CAMELOT_CLI SHARED UTILITIES
 * 
 * Shared logic for the unified Camelot CLI.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Load Env ---
const env = {};
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            if (key && !key.startsWith('#')) env[key] = value;
        }
    });
}

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'lisascustomkeychains.myshopify.com';
const storefrontAccessToken = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const adminAccessToken = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

/**
 * Logs with Kinetic Runes
 */
function logRune(rune, action) {
    console.log(`[${rune}] ${action}`);
}

/**
 * Generic Shopify Fetch (Storefront or Admin)
 */
function shopifyFetch({ query, variables, isAdmin = false, customPath = null }) {
    return new Promise((resolve, reject) => {
        const token = isAdmin ? adminAccessToken : storefrontAccessToken;
        const headerName = isAdmin ? 'X-Shopify-Access-Token' : 'X-Shopify-Storefront-Access-Token';
        const defaultPath = isAdmin ? '/admin/api/2023-10/graphql.json' : '/api/2023-10/graphql.json';

        if (!token) {
            reject(new Error(`${isAdmin ? 'Admin' : 'Storefront'} access token is missing.`));
            return;
        }

        const options = {
            hostname: domain,
            path: customPath || defaultPath,
            method: query ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
                [headerName]: token,
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (d) => { data += d; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data); // Return raw if not JSON
                    }
                } else {
                    reject(new Error(`Status Code: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (query) req.write(JSON.stringify({ query, variables }));
        req.end();
    });
}

module.exports = {
    env,
    domain,
    storefrontAccessToken,
    adminAccessToken,
    logRune,
    shopifyFetch,
    KINETIC_RUNES: {
        ACTUATE: "Ω_ACTUATE",
        AUDIT: "Ω_AUDIT",
        KINETIC: "Ω_KINETIC",
        DIAG: "Ω_DIAG",
    }
};
