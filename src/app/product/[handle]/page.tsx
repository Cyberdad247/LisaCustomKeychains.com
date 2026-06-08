import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ProductJSONLD from "@/components/ProductJSONLD";
import { getAllProducts } from "@/lib/shopify";
import type { ShopifyProduct, ShopifyProductEdge } from "@/lib/shopify/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const products = await getAllProducts();
  return products.find(({ node }: ShopifyProductEdge) => node.handle === handle)?.node ?? null;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map(({ node }: ShopifyProductEdge) => ({
    handle: node.handle,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: `Product Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const image = product.featuredImage || product.images?.edges[0]?.node;
  const description =
    product.description ||
    `Customize ${product.title}, handcrafted by ${SITE_NAME}.`;

  return {
    title: `${product.title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: `${SITE_URL}/product/${product.handle}`,
    },
    openGraph: {
      title: `${product.title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/product/${product.handle}`,
      images: image ? [{ url: image.url, alt: image.altText || product.title }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const images = [
    product.featuredImage,
    ...(product.images?.edges ?? []).map(({ node }) => node),
  ].filter(Boolean);

  const uniqueImages = images.filter(
    (image, index, list) => list.findIndex((candidate) => candidate.url === image.url) === index
  );

  const price =
    product.priceRange?.minVariantPrice?.amount ||
    product.variants?.edges[0]?.node?.price?.amount ||
    "9.95";
  const currency = product.priceRange?.minVariantPrice?.currencyCode || "USD";

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <ProductJSONLD products={[product]} />
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        <Link
          href="/#products"
          className="mb-8 inline-flex text-xs font-black uppercase tracking-[0.25em] text-purple-700 hover:text-purple-950"
        >
          Back to collection
        </Link>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
              {uniqueImages[0] ? (
                <Image
                  src={uniqueImages[0].url}
                  alt={uniqueImages[0].altText || product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400">
                  No image available
                </div>
              )}
            </div>

            {uniqueImages.length > 1 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {uniqueImages.slice(1, 5).map((image) => (
                  <div
                    key={image.url}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-purple-600">
                Custom Design
              </p>
              <h1 className="font-serif text-4xl font-bold leading-tight text-slate-950">
                {product.title}
              </h1>
              <p className="mt-4 text-2xl font-black text-slate-900">
                ${Number.parseFloat(price).toFixed(2)} {currency}
              </p>
              <p className="mt-6 text-base leading-8 text-slate-600">
                {product.description ||
                  "Handcrafted with love. Use this design as your starting point, then personalize the colors, beads, letters, and charm details."}
              </p>
              <a
                href="#personalize"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl transition hover:bg-purple-700"
              >
                Personalize this design
              </a>
            </div>

            <div id="personalize" className="scroll-mt-32">
              <ProductCard product={product} rotation={0} priority />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
