import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Star, Truck, ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductCard, type Product } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

function ProductPage() {
  const { id } = Route.useParams();
  const { t, formatPrice } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Review[];
    setReviews(list);
    if (user) {
      const mine = list.find((r) => r.user_id === user.id);
      setMyRating(mine?.rating ?? 0);
      setMyComment(mine?.comment ?? "");
    }
  }, [id, user]);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setProduct(data);
      setActiveImg(0);
      if (data?.category_id) {
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("category_id", data.category_id)
          .neq("id", id)
          .limit(8)
          .then(({ data: rel }) => setRelated((rel as Product[]) ?? []));
      } else {
        setRelated([]);
      }
    });
    loadReviews();
  }, [id, loadReviews]);

  if (!product) return <div className="p-8 text-center text-muted-foreground">…</div>;

  const finalPrice = product.sale_price ?? product.price;
  const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  const images: string[] = product.images ?? [];

  const addToCart = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: user.id, product_id: product.id, quantity: qty },
      { onConflict: "user_id,product_id" }
    );
    if (error) toast.error(error.message); else toast.success(t("addToCart"));
  };

  const submitReview = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (myRating < 1) { toast.error(t("pickRating")); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { product_id: product.id, user_id: user.id, rating: myRating, comment: myComment || null, updated_at: new Date().toISOString() },
      { onConflict: "product_id,user_id" }
    );
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("reviewSaved"));
    await loadReviews();
    const { data: fresh } = await supabase.from("products").select("rating, reviews_count").eq("id", id).maybeSingle();
    if (fresh) setProduct({ ...product, ...fresh });
  };

  const deleteMyReview = async () => {
    if (!user) return;
    const { error } = await supabase.from("reviews").delete().eq("product_id", product.id).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    setMyRating(0);
    setMyComment("");
    await loadReviews();
    const { data: fresh } = await supabase.from("products").select("rating, reviews_count").eq("id", id).maybeSingle();
    if (fresh) setProduct({ ...product, ...fresh });
  };

  const hasMyReview = !!user && reviews.some((r) => r.user_id === user.id);
  const otherReviews = user ? reviews.filter((r) => r.user_id !== user.id) : reviews;

  return (
    <main className="mx-auto max-w-5xl px-4 py-4 md:py-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4" /> {t("backHome")}
      </Link>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted shadow-card">
            {images[activeImg] && <img src={images[activeImg]} alt={product.name} className="h-full w-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
          {product.rating ? (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">{Number(product.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviews_count} {t("reviews")})</span>
            </div>
          ) : null}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatPrice(finalPrice)}</span>
            {product.sale_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <span className="rounded-full bg-gradient-sale px-2 py-0.5 text-xs font-bold text-sale-foreground">-{discount}%</span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4" />
            {t("shipping")}: {product.shipping_cost === 0 ? t("free") : formatPrice(product.shipping_cost)}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t("quantity")}</span>
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted rounded-full"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-muted rounded-full"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-xs text-muted-foreground">In stock: {product.stock}</span>
          </div>
          <Button onClick={addToCart} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold">
            {t("addToCart")}
          </Button>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12 space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">{t("customerReviews")}</h2>
          {reviews.length > 0 && (
            <span className="text-sm text-muted-foreground">{reviews.length} {t("reviews")}</span>
          )}
        </div>

        {/* Write / edit review */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6 shadow-soft">
          <h3 className="font-semibold mb-3">{hasMyReview ? t("editYourReview") : t("writeReview")}</h3>
          {!user ? (
            <div className="text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary font-semibold hover:underline">{t("signIn")}</Link> {t("toLeaveReview")}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t("yourRating")}:</span>
                <StarRating value={myRating} onChange={setMyRating} size={28} />
              </div>
              <Textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder={t("reviewPlaceholder")}
                rows={3}
                className="resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={submitReview} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {submitting ? "…" : hasMyReview ? t("updateReview") : t("submitReview")}
                </Button>
                {hasMyReview && (
                  <Button variant="outline" onClick={deleteMyReview} className="gap-1.5">
                    <Trash2 className="h-4 w-4" /> {t("delete")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* All reviews list */}
        {otherReviews.length === 0 && !hasMyReview ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("noReviewsYet")}
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <StarRating value={r.rating} readOnly size={16} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-sm whitespace-pre-line">{r.comment}</p>}
                {user && r.user_id === user.id && (
                  <span className="mt-2 inline-block text-[10px] uppercase tracking-wider text-primary font-bold">
                    {t("yourReview")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-bold">{t("similarProducts")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </main>
  );
}
