import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Settings, Package, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages, currencies, countries } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Account — Vura" }] }),
});

function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const { t, lang, setLang, currency, setCurrency, country, setCountry } = useApp();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-2">{t("welcome")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("welcomeDesc")}</p>
        <Link to="/auth"><Button className="bg-primary text-primary-foreground">{t("signIn")}</Button></Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-4 md:py-8 space-y-6">
      <section className="rounded-3xl bg-gradient-hero p-6 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-2xl font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{user.user_metadata?.full_name ?? user.email}</p>
            <p className="text-sm text-foreground/70 truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                <Shield className="h-3 w-3" /> ADMIN
              </span>
            )}
          </div>
        </div>
      </section>

      {isAdmin && (
        <Link to="/admin" className="block rounded-2xl bg-foreground p-4 text-background shadow-card hover:opacity-90 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{t("admin")}</p>
              <p className="text-xs opacity-80">Manage products, view analytics</p>
            </div>
            <Shield className="h-5 w-5" />
          </div>
        </Link>
      )}

      <section className="rounded-2xl bg-card p-4 shadow-soft space-y-4">
        <h3 className="flex items-center gap-2 font-semibold"><Settings className="h-4 w-4" /> {t("settings")}</h3>
        <div className="grid gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("language")}</label>
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{languages.map((l) => <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("currency")}</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("country")}</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} — ${c.baseShipping}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-soft">
        <h3 className="flex items-center gap-2 font-semibold mb-3"><Package className="h-4 w-4" /> {t("orders")}</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
                <div>
                  <p className="font-medium">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold">${Number(o.total).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Button onClick={() => { signOut(); toast.success("Signed out"); }} variant="outline" className="w-full">
        <LogOut className="h-4 w-4 me-2" /> {t("signOut")}
      </Button>
    </main>
  );
}
