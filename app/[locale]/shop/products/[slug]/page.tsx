import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ProductActions } from "@/components/shop/ProductActions";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.shopProduct.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const relatedProducts = await prisma.shopProduct.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: { category: true },
    take: 4,
  });

  let images: string[] = [];
  try { images = JSON.parse(product.images); } catch { images = []; }
  let specs: Record<string, string> = {};
  try { specs = JSON.parse(product.specifications); } catch { specs = {}; }
  let tags: string[] = [];
  try { tags = JSON.parse(product.tags); } catch { tags = []; }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const inStock = product.stock > 0;
  const mainImage = images[0] || "/images/shop/placeholder.jpg";

  return (
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex items-center gap-2 text-sm text-text-dim mb-8">
            <Link href="/shop" className="hover:text-accent transition-colors">Shop</Link>
            <span>/</span>
            <Link href="/shop/products" className="hover:text-accent transition-colors">Products</Link>
            <span>/</span>
            <Link href={`/shop/products?category=${product.category.slug}`} className="hover:text-accent transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-text-secondary">{product.name}</span>
          </nav>
        </FadeIn>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <FadeIn>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface border border-border">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </FadeIn>

          {/* Info */}
          <FadeIn delay={100}>
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-accent-dim text-accent rounded-full mb-3">
                {product.category.name}
              </span>

              <h1
                className="text-3xl md:text-4xl font-bold text-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <span className="text-text-muted text-sm">
                  ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold gold-text">{product.price.toFixed(2)} TND</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-text-dim line-through">
                      {product.compareAtPrice!.toFixed(2)} TND
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                {inStock ? (
                  <span className="text-emerald-400 text-sm font-medium">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-400 text-sm font-medium">✗ Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <p className="text-text-muted leading-relaxed whitespace-pre-line mb-8">{product.description}</p>

              {/* Actions */}
              {inStock && (
                <ProductActions
                  product={{
                    id: String(product.id),
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    images: product.images,
                    stock: product.stock,
                  }}
                />
              )}

              {/* Specifications */}
              {Object.keys(specs).length > 0 && (
                <div className="border-t border-border pt-6 mt-6">
                  <h3
                    className="text-lg font-bold text-text mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Specifications
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-border bg-surface">
                    <table className="premium-table w-full">
                      <tbody>
                        {Object.entries(specs).map(([key, value]) => (
                          <tr key={key}>
                            <td className="font-medium text-text-muted w-1/3">{key}</td>
                            <td>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        <div className="section-divider mx-auto mt-16 w-24" />

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="py-12">
            <FadeIn>
              <h2
                className="text-2xl md:text-3xl font-bold text-text mb-8"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Customer <span className="gold-text">Reviews</span>
              </h2>
            </FadeIn>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-text">{review.authorName}</span>
                  </div>
                  <p className="text-sm text-text-muted">{review.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <>
            <div className="section-divider mx-auto w-24" />
            <section className="py-12">
              <FadeIn>
                <h2
                  className="text-2xl md:text-3xl font-bold text-text mb-8"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Related <span className="gold-text">Products</span>
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p, i) => (
                  <FadeIn key={p.id} delay={i * 100}>
                    <ShopProductCard product={p} />
                  </FadeIn>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
