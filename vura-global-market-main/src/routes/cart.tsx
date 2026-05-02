import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { countries } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — Vura" }] }),
});

interface CartRow {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    images: string[] | null;
    shipping_cost: number | null;
  };
}

function CartPage() {
  const { user } = useAuth();
  const { t, formatPrice, country } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(id, name, price, sale_price, images, shipping_cost)")
      .eq("user_id", user.id);
    setItems((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateQty = async (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };
  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((s, i) => s + (i.product.sale_price ?? i.product.price) * i.quantity, 0);
  const shippingItems = items.reduce((s, i) => s + (i.product.shipping_cost ?? 0) * i.quantity, 0);
  const countryFee = countries.find((c) => c.code === country)?.baseShipping ?? 0;
  const total = subtotal + shippingItems + countryFee;

  const checkout = async () => {
    if (!user || items.length === 0) return;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, currency: "USD", shipping_country: country, status: "pending" })
      .select().single();
    if (error || !order) { toast.error(error?.message ?? "Error"); return; }
    await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        unit_price: i.product.sale_price ?? i.product.price,
        quantity: i.quantity,
      }))
    );
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    toast.success("Order placed!");
    navigate({ to: "/account" });
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">{t("welcome")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("welcomeDesc")}</p>
        <Link to="/auth">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">{t("signIn")}</Button>
        </Link>
      </main>
    );
  }
  if (loading) return <div className="p-8 text-center text-muted-foreground">…</div>;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">{t("cartEmpty")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("cartEmptyDesc")}</p>
        <Link to="/"><Button className="bg-primary text-primary-foreground">{t("startShopping")}</Button></Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4 md:py-8 space-y-4">
      <h1 className="text-2xl font-bold">{t("cart")}</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              {i.product.images?.[0] && <img src={i.product.images[0]} alt={i.product.name} className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-sm font-medium">{i.product.name}</h3>
              <p className="mt-1 text-base font-bold">{formatPrice(i.product.sale_price ?? i.product.price)}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-full border border-border">
                  <button onClick={() => updateQty(i.id, i.quantity - 1)} className="p-1.5 hover:bg-muted rounded-full"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-7 text-center text-sm font-semibold">{i.quantity}</span>
                  <button onClick={() => updateQty(i.id, i.quantity + 1)} className="p-1.5 hover:bg-muted rounded-full"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button onClick={() => remove(i.id)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-soft space-y-2">
        <div className="flex justify-between text-sm"><span>{t("subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>{t("shipping")}</span><span>{formatPrice(shippingItems + countryFee)}</span></div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>{t("total")}</span><span>{formatPrice(total)}</span></div>
        <Button onClick={checkout} className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold">
          {t("checkout")}
        </Button>
      </div>
    </main>
  );
}
