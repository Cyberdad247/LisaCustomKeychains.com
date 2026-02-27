#!/usr/bin/env node

/**
 * 🏰 CAMELOT_CLI: UNIFIED SOVEREIGN TOOLSET
 * 
 * Central command dispatcher for all LisaCustomKeychains.com operations.
 */

const { logRune, KINETIC_RUNES, env } = require('./camelot_utils');
const { execSync } = require('child_process');
const path = require('path');

// --- Inject Env for Child Processes ---
Object.assign(process.env, env);

const ARGS = process.argv.slice(2);
const COMMAND = ARGS[0];
const SUBCOMMAND = ARGS[1];

const HELP_MENU = `
🏰 CAMELOT_CLI (v1.0.0)

Usage: node scripts/camelot.js <command> [subcommand]

Commands:
  sync                  Manage Shopify data synchronization
    all                 Run full product sync (Storefront + Admin)
    products            Sync only products
    earrings            Run earring-specific admin sync
    inventory           Update product inventory levels

  diag                  Run system diagnostics
    connection          Test Shopify API connectivity
    admin               Verify Admin API credentials
    domains             Check Shopify custom domains
    cart                Validate checkout/cart functionality
    prices              Audit price consistency across channels

  test                  Development and QA tests
    fallback            Test mock data fallback logic
    charms              Verify earring charm data flow

  run <filename>        Run a legacy script from the scripts/ directory

Options:
  --help                Show this menu
`;

function runLegacyScript(scriptName) {
    const scriptPath = path.join(__dirname, scriptName.endsWith('.js') ? scriptName : `${scriptName}.js`);
    logRune(KINETIC_RUNES.KINETIC, `Running legacy script: ${scriptName}`);
    try {
        execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } catch (e) {
        process.exit(1);
    }
}

async function main() {
    if (!COMMAND || COMMAND === '--help') {
        console.log(HELP_MENU);
        return;
    }

    switch (COMMAND) {
        case 'sync':
            switch (SUBCOMMAND) {
                case 'all':
                    runLegacyScript('sync_shopify_all');
                    break;
                case 'products':
                    runLegacyScript('sync_shopify_products');
                    break;
                case 'earrings':
                    runLegacyScript('create_earrings_admin');
                    break;
                case 'inventory':
                    runLegacyScript('update_inventory');
                    break;
                default:
                    console.log("Usage: camelot sync [all|products|earrings|inventory]");
                    break;
            }
            break;

        case 'diag':
            switch (SUBCOMMAND) {
                case 'connection':
                    runLegacyScript('test_shopify_connection');
                    break;
                case 'admin':
                    runLegacyScript('test_admin_connection');
                    break;
                case 'domains':
                    runLegacyScript('check_shopify_domains');
                    break;
                case 'cart':
                    runLegacyScript('test_cart');
                    break;
                case 'prices':
                    runLegacyScript('check_shopify_prices');
                    break;
                default:
                    console.log("Usage: camelot diag [connection|admin|domains|cart|prices]");
                    break;
            }
            break;

        case 'test':
            switch (SUBCOMMAND) {
                case 'fallback':
                    runLegacyScript('test_mock_fallback');
                    break;
                case 'charms':
                    runLegacyScript('verify_earring_charms');
                    break;
                default:
                    console.log("Usage: camelot test [fallback|charms]");
                    break;
            }
            break;

        case 'run':
            if (!SUBCOMMAND) {
                console.log("Error: Specify a script name to run.");
                return;
            }
            runLegacyScript(SUBCOMMAND);
            break;

        default:
            console.log(`Unknown command: ${COMMAND}`);
            console.log(HELP_MENU);
            break;
    }
}

main().catch(err => {
    console.error(`❌ CLI Failure: ${err.message}`);
    process.exit(1);
});
