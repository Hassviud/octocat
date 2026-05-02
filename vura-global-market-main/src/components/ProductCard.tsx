import { Link } from "@tanstack/react-router";
import { Star, Truck } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";

export interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  images: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  shipping_cost: number | null;
  stock: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { t, formatPrice } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const finalPrice = product.sale_price ?? product.price;
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const img = product.images?.[0];

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase
      .from("cart_items")
      .upsert({ user_id: user.id, product_id: product.id, quantity: 1 }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message);
    else toast.success(t("addToCart"));
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition hover:shadow-card hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 start-2 rounded-full bg-gradient-sale px-2.5 py-1 text-[10px] font-bold text-sale-foreground shadow-soft">
            -{discount}%
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-foreground">{formatPrice(finalPrice)}</span>
          {product.sale_price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {product.rating ? (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {Number(product.rating).toFixed(1)}
              {product.reviews_count ? <span className="ms-0.5">({product.reviews_count})</span> : null}
            </span>
          ) : null}
          <span className="flex items-center gap-0.5">
            <Truck className="h-3 w-3" />
            {product.shipping_cost === 0 ? t("free") : formatPrice(product.shipping_cost ?? 0)}
          </span>
        </div>
        <Button
          size="sm"
          onClick={addToCart}
          className="mt-1 h-8 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
        >
          {t("addToCart")}
        </Button>
      </div>
    </Link>
  );
}
