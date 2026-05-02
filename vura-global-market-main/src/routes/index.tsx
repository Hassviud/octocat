import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, Zap, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero.jpg";
import summerSaleImg from "@/assets/summer-sale.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Vura — Shop the world" },
      { name: "description", content: "Discover global deals on electronics, fashion, beauty and more." },
    ],
  }),
});

interface Category { id: string; name: string; slug: string; icon: string | null; }

function HomePage() {
  const { t } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories(data ?? []));
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(12).then(({ data }) => setProducts((data as Product[]) ?? []));
    supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(6).then(({ data }) => setFeatured((data as Product[]) ?? []));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 md:py-8 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero shadow-glow">
        <div className="grid md:grid-cols-2 items-center gap-4 p-6 md:p-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Free worldwide delivery on orders $50+
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground">
              {t("tagline")}
            </h1>
            <Link to="/search" search={{ q: "", category: "" }} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition">
              {t("startShopping")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={heroImg} alt="" width={1536} height={768} className="rounded-2xl object-cover max-h-72 md:max-h-none" />
        </div>
      </section>

      {/* Search bar */}
      <Link to="/search" search={{ q: "", category: "" }} className="block">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-soft transition hover:shadow-card">
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("searchPlaceholder")}</span>
        </div>
      </Link>

      {/* Summer Sale Banner */}
      <Link
        to="/search"
        search={{ q: "", category: "" }}
        className="group relative block overflow-hidden rounded-3xl shadow-glow ring-1 ring-border"
      >
        <img
          src={summerSaleImg}
          alt={t("summerSale")}
          loading="lazy"
          width={1920}
          height={1080}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 md:h-80 lg:h-96"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 md:p-12">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sale px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg animate-pulse">
            <Zap className="h-3.5 w-3.5" /> {t("limitedTime")}
          </span>
          <h2 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
            {t("summerSale")}
          </h2>
          <p className="text-lg font-bold text-primary drop-shadow md:text-2xl lg:text-3xl">
            {t("upTo90")}
          </p>
          <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition group-hover:scale-105 md:text-base">
            {t("shopNow")} <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{t("categories")}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/search"
              search={{ q: "", category: c.slug }}
              className="flex flex-col items-center gap-2 min-w-[80px]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-soft transition hover:scale-105 hover:shadow-glow">
                <span className="text-2xl">🛍️</span>
              </div>
              <span className="text-xs font-medium text-center">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash sale / Featured */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Zap className="h-5 w-5 text-sale" /> {t("flashSale")}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* All products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{t("trending")}</h2>
        </div>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {t("noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}
