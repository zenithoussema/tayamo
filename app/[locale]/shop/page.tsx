import { prisma } from "@/lib/db";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [categories, featuredProducts, bestSellers, newArrivals, allProducts] =
    await Promise.all([
      prisma.shopCategory.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: { where: { isActive: true } } } } },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.shopProduct.findMany({
        where: { isFeatured: true, isActive: true },
        include: { category: true },
        take: 4,
        orderBy: { rating: "desc" },
      }),
      prisma.shopProduct.findMany({
        where: { isBestSeller: true, isActive: true },
        include: { category: true },
        take: 4,
        orderBy: { rating: "desc" },
      }),
      prisma.shopProduct.findMany({
        where: { isNew: true, isActive: true },
        include: { category: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.shopProduct.findMany({
        where: { isActive: true },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <section className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-bg via-surface to-bg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle,rgba(212,175,55,0.07)_0%,transparent_60%)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03)_0%,transparent_50%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-36 lg:pt-44 pb-24 lg:pb-32 text-center">
          <FadeIn>
            <span className="inline-block px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-accent border border-accent/20 rounded-full mb-8 backdrop-blur-sm">
              Premium Sports Nutrition
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1
              className="text-5xl md:text-6xl lg:text-8xl font-bold text-text mb-8 leading-[1.05]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Fuel Your<br />
              <span className="gold-text">Performance</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-lg lg:text-xl text-text-dim max-w-2xl mx-auto mb-12 leading-relaxed">
              Premium whey proteins, creatine, pre-workouts and healthy snacks from the world&apos;s leading supplement brands.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/shop/products"
                className="inline-flex items-center gap-2 px-10 py-4 bg-accent text-text-on-accent text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-accent-hover transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
              >
                Shop Now
              </Link>
              <Link
                href="/shop/products"
                className="inline-flex items-center gap-2 px-10 py-4 border border-border-strong text-text-secondary text-sm font-bold uppercase tracking-wider rounded-xl hover:border-accent/40 hover:text-accent transition-all duration-300"
              >
                Best Sellers
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <FadeIn>
              <div className="text-center mb-14">
                <h2
                  className="text-3xl md:text-5xl font-bold text-text mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Shop by <span className="gold-text">Category</span>
                </h2>
                <p className="text-text-dim text-sm">Premium supplements for every goal</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {categories.map((cat, i) => (
                <FadeIn key={cat.id} delay={i * 60}>
                  <Link
                    href={`/shop/products?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface border border-border transition-all duration-500 hover:border-accent/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.05)] hover:-translate-y-1 text-center"
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors duration-300">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] text-text-dim uppercase tracking-wider">
                      {cat._count.products} products
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="section-divider mx-auto w-24" />
      </div>

      {/* FEATURED */}
      {featuredProducts.length > 0 && (
        <section className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Featured <span className="gold-text">Products</span>
                  </h2>
                  <p className="text-text-dim text-sm">Hand-picked by our nutrition experts</p>
                </div>
                <Link href="/shop/products" className="hidden sm:inline-flex text-accent hover:text-accent-hover text-sm font-medium transition-colors">
                  View All →
                </Link>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <FadeIn key={product.id} delay={i * 80}>
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="group block rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-500 hover:border-accent/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative aspect-square bg-surface-elevated overflow-hidden">
                      <img
                        src={(() => { try { return JSON.parse(product.images)[0] } catch { return "" } })()}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {product.isBestSeller && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-accent text-text-on-accent text-[10px] font-bold uppercase tracking-wider">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-muted">
                        {product.brand}
                      </span>
                      <h3 className="text-sm font-semibold text-text mt-1 line-clamp-1 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <span className="gold-text text-lg font-bold mt-2 block">{product.price.toFixed(2)} TND</span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="section-divider mx-auto w-24" />
      </div>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Best <span className="gold-text">Sellers</span>
                </h2>
                <p className="text-text-dim text-sm">Most loved by athletes</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {bestSellers.map((product, i) => (
                <FadeIn key={product.id} delay={i * 80}>
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="group block rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-500 hover:border-accent/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative aspect-square bg-surface-elevated overflow-hidden">
                      <img
                        src={(() => { try { return JSON.parse(product.images)[0] } catch { return "" } })()}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-muted">
                        {product.brand}
                      </span>
                      <h3 className="text-sm font-semibold text-text mt-1 line-clamp-1 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <span className="gold-text text-lg font-bold mt-2 block">{product.price.toFixed(2)} TND</span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="section-divider mx-auto w-24" />
      </div>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    New <span className="gold-text">Arrivals</span>
                  </h2>
                  <p className="text-text-dim text-sm">Just landed in store</p>
                </div>
                <Link href="/shop/products" className="hidden sm:inline-flex text-accent hover:text-accent-hover text-sm font-medium transition-colors">
                  View All →
                </Link>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {newArrivals.map((product, i) => (
                <FadeIn key={product.id} delay={i * 80}>
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="group block rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-500 hover:border-accent/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative aspect-square bg-surface-elevated overflow-hidden">
                      <img
                        src={(() => { try { return JSON.parse(product.images)[0] } catch { return "" } })()}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                        New
                      </span>
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-muted">
                        {product.brand}
                      </span>
                      <h3 className="text-sm font-semibold text-text mt-1 line-clamp-1 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <span className="gold-text text-lg font-bold mt-2 block">{product.price.toFixed(2)} TND</span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL PRODUCTS */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="section-divider mx-auto w-24" />
      </div>
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  All <span className="gold-text">Products</span>
                </h2>
                <p className="text-text-dim text-sm">Browse our complete supplement collection</p>
              </div>
              <Link href="/shop/products" className="hidden sm:inline-flex text-accent hover:text-accent-hover text-sm font-medium transition-colors">
                View All →
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {allProducts.map((product, i) => (
              <FadeIn key={product.id} delay={i * 80}>
                <Link
                  href={`/shop/products/${product.slug}`}
                  className="group block rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-500 hover:border-accent/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                >
                  <div className="relative aspect-square bg-surface-elevated overflow-hidden">
                    <img
                      src={(() => { try { return JSON.parse(product.images)[0] } catch { return "" } })()}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-muted">
                      {product.brand}
                    </span>
                    <h3 className="text-sm font-semibold text-text mt-1 line-clamp-1 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <span className="gold-text text-lg font-bold mt-2 block">{product.price.toFixed(2)} TND</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
