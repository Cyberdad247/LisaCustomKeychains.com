import { NextResponse } from "next/server";

import { getStorefrontConfig } from "@/lib/storefront-config";

export async function GET() {
  const config = await getStorefrontConfig();
  return NextResponse.json(config);
}
