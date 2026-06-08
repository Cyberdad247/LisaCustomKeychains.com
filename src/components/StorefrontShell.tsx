"use client";

import { usePathname } from "next/navigation";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";

const ADMIN_PREFIXES = ["/editor", "/client-editor"];

export default function StorefrontShell() {
  const pathname = usePathname();
  const isAdmin = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAdmin) return null;
  return (
    <>
      <CartDrawer />
      <Footer />
    </>
  );
}
