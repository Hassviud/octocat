import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, TrendingUp, ShoppingBag, Users, DollarSign, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Vura" }] }),
});

interface Product {
  id: string; name: string; description: string | null;
  price: number; sale_price: number | null; stock: number;
  category_id: string | null; images: string[]; is_active: boolean;
  is_featured: boolean; shipping_cost: number | null;
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [user, isAdmin, loading]);

  const loadAll = async () => {
    const [{ data: p }, { data: c }, { data: o }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("orders").select("total, user_id"),
    ]);
    setProducts((p as any) ?? []);
    setCategories(c ?? []);
    const orders = o ?? [];
    setStats({
      revenue: orders.reduce((s, o: any) => s + Number(o.total), 0),
      orders: orders.length,
      products: p?.length ?? 0,
      users: new Set(orders.map((o: any) => o.user_id)).size,
    });
  };

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  if (loading || !isAdmin) return <div className="p-8 text-center text-muted-foreground">…</div>;

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Deleted");
    loadAll();
  };

  const openEdit = (p?: Product) => { setEditing(p ?? null); setOpen(true); };

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("admin")}</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label={t("revenue")} value={`$${stats.revenue.toFixed(2)}`} color="bg-gradient-primary" />
        <StatCard icon={ShoppingBag} label={t("totalOrders")} value={stats.orders} />
        <StatCard icon={Package} label={t("totalProducts")} value={stats.products} />
        <StatCard icon={Users} label={t("totalUsers")} value={stats.users} />
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">{t("adminProducts")}</TabsTrigger>
          <TabsTrigger value="orders">{t("adminOrders")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("adminAnalytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => openEdit()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 me-2" /> {t("adminAddProduct")}
            </Button>
          </div>
          <div className="rounded-2xl bg-card shadow-soft overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase">
                <tr>
                  <th className="p-3 text-start">Image</th>
                  <th className="p-3 text-start">Name</th>
                  <th className="p-3 text-start">Price</th>
                  <th className="p-3 text-start">Stock</th>
                  <th className="p-3 text-start">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-2">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                    </td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">${p.price} {p.sale_price && <span className="text-sale text-xs">→ ${p.sale_price}</span>}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? "bg-success/20 text-success" : "bg-muted"}`}>
                        {p.is_active ? "Active" : "Hidden"}
                      </span>
                      {p.is_featured && <span className="ms-1 text-xs px-2 py-1 rounded-full bg-primary/20">Featured</span>}
                    </td>
                    <td className="p-3 flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products yet. Add your first one!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("edit") : t("adminAddProduct")}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editing}
            categories={categories}
            onSaved={() => { setOpen(false); loadAll(); }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${color ?? "bg-accent"} mb-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProductForm({ product, categories, onSaved }: any) {
  const { user } = useAuth();
  const { t } = useApp();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    sale_price: product?.sale_price ?? "",
    stock: product?.stock ?? 100,
    category_id: product?.category_id ?? "",
    shipping_cost: product?.shipping_cost ?? 0,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    images: product?.images ?? [],
  });
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `${user!.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f: any) => ({ ...f, images: [...f.images, publicUrl] }));
    setUploading(false);
  };

  const save = async () => {
    const payload: any = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price === "" ? null : Number(form.sale_price),
      stock: Number(form.stock),
      category_id: form.category_id || null,
      shipping_cost: Number(form.shipping_cost),
      is_active: form.is_active,
      is_featured: form.is_featured,
      images: form.images,
      created_by: user!.id,
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(t("saved"));
    onSaved();
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>{t("productName")}</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>{t("description")}</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>{t("price")} (USD)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div><Label>{t("salePrice")}</Label><Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} /></div>
        <div><Label>{t("stock")}</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
        <div><Label>{t("shipping")} (USD)</Label><Input type="number" step="0.01" value={form.shipping_cost} onChange={(e) => setForm({ ...form, shipping_cost: e.target.value })} /></div>
      </div>
      <div>
        <Label>{t("category")}</Label>
        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>{t("images")}</Label>
        <div className="flex gap-2 flex-wrap mt-2">
          {form.images.map((url: string, i: number) => (
            <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button onClick={() => setForm({ ...form, images: form.images.filter((_: any, idx: number) => idx !== i) })}
                className="absolute top-0 end-0 bg-destructive text-destructive-foreground rounded-bl-lg p-0.5">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary text-xs text-muted-foreground">
            <Upload className="h-4 w-4 mb-1" />
            {uploading ? "..." : t("upload")}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
      <div className="flex items-center justify-between"><Label>Featured (Flash sale)</Label><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /></div>
      <Button onClick={save} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{t("save")}</Button>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setOrders(data ?? []));
  }, []);
  return (
    <div className="rounded-2xl bg-card shadow-soft divide-y divide-border">
      {orders.length === 0 && <p className="p-8 text-center text-muted-foreground">No orders yet</p>}
      {orders.map((o) => (
        <div key={o.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-sm">#{o.id.slice(0, 8)}</p>
            <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.shipping_country} · {o.order_items?.length ?? 0} items</p>
          </div>
          <div className="text-end">
            <p className="font-bold">${Number(o.total).toFixed(2)}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{o.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState<{ topProducts: any[]; revenueByDay: any[] }>({ topProducts: [], revenueByDay: [] });
  useEffect(() => {
    (async () => {
      const { data: items } = await supabase.from("order_items").select("product_name, quantity, unit_price");
      const { data: orders } = await supabase.from("orders").select("created_at, total");
      const map = new Map<string, { qty: number; revenue: number }>();
      (items ?? []).forEach((i: any) => {
        const e = map.get(i.product_name) ?? { qty: 0, revenue: 0 };
        e.qty += i.quantity; e.revenue += i.quantity * Number(i.unit_price);
        map.set(i.product_name, e);
      });
      const top = Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

      const dayMap = new Map<string, number>();
      (orders ?? []).forEach((o: any) => {
        const d = new Date(o.created_at).toLocaleDateString();
        dayMap.set(d, (dayMap.get(d) ?? 0) + Number(o.total));
      });
      const revenueByDay = Array.from(dayMap.entries()).map(([day, total]) => ({ day, total }));
      setData({ topProducts: top, revenueByDay });
    })();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-card p-4 shadow-soft">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Top Products</h3>
        {data.topProducts.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
          <div className="space-y-2">
            {data.topProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="truncate">{p.name}</span>
                <span className="font-bold">${p.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-soft">
        <h3 className="font-semibold mb-3">Revenue by Day</h3>
        {data.revenueByDay.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
          <div className="space-y-2">
            {data.revenueByDay.map((d) => (
              <div key={d.day} className="flex items-center justify-between text-sm">
                <span>{d.day}</span>
                <span className="font-bold">${d.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
