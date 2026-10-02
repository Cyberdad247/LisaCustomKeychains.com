import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// MOD_05: ASYNC NOTIFICATION HOOK & IDEMPOTENCY DEDUPLICATION (inv_04)
// ============================================================================

// Memory-backed atomic idempotency store for webhook deduplication (inv_04)
// In production, backed by Redis / Upstash KV.
const processedOrderLedger = new Set<string>();

const SMS_TEMPLATE = "Your custom creation is polished and ready at the main booth counter!";
const REQUIRED_TAG = "Vercel-Booths-Pickup";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const orderId = payload?.id?.toString() || payload?.order_id?.toString();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // inv_04_idempotency: Strictly enforce webhook deduplication on order_id
    if (processedOrderLedger.has(orderId)) {
      return NextResponse.json(
        { status: 'already_processed', message: 'Order webhook already handled (idempotent noop)' },
        { status: 200 }
      );
    }

    // Inspect order tags and line item properties
    const orderTags: string = payload?.tags || '';
    const lineItems = payload?.line_items || [];
    const hasBoothTag =
      orderTags.includes(REQUIRED_TAG) ||
      lineItems.some((item: any) =>
        item.properties?.some?.((p: any) => p.name === 'Order_Tag' && p.value === REQUIRED_TAG)
      );

    if (!hasBoothTag) {
      // Mark as processed so we don't re-scan non-booth orders
      processedOrderLedger.add(orderId);
      return NextResponse.json(
        { status: 'ignored', message: 'Order does not hold Vercel-Booths-Pickup tag' },
        { status: 200 }
      );
    }

    // Extract customer phone
    const clientPhone =
      payload?.customer?.phone ||
      payload?.shipping_address?.phone ||
      lineItems
        .flatMap((i: any) => i.properties || [])
        .find((p: any) => p.name === 'Client_Phone')?.value;

    // Simulate / Trigger Twilio dispatch via Shopify Flow
    console.log(`[MOD_05_SMS_DISPATCH] Order #${orderId} fulfilled. Relaying SMS to: ${clientPhone}`);
    console.log(`[MOD_05_SMS_DISPATCH] Message: "${SMS_TEMPLATE}"`);

    // Atomically commit to idempotency ledger
    processedOrderLedger.add(orderId);

    return NextResponse.json({
      status: 'dispatched',
      order_id: orderId,
      relay_gateway: 'Twilio_via_Shopify_Flow',
      filter_tag: REQUIRED_TAG,
      sms_template: SMS_TEMPLATE,
      recipient: clientPhone || 'ON_RECORD',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
