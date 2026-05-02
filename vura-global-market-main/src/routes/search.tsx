import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) ?? "",
    category: (s.category as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Search — Vura" },
      { name: "description", content: "Search global products on Vura." },
    ],
  }),
});

function SearchPage() {
  const { t } = useApp();
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.q);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from("products").select("*, categories(slug)").eq("is_active", true).limit(60);
    if (query) q = q.ilike("name", `%${query}%`);
    q.then(({ data }) => {
      let list = (data as any[]) ?? [];
      if (search.category) list = list.filter((p) => p.categories?.slug === search.category);
      setProducts(list as Product[]);
      setLoading(false);
    });
  }, [query, search.category]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 md:py-8 space-y-6">
      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          autoFocus
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ps-12 h-12 rounded-full text-base"
        />
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">{t("noResults")}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}
