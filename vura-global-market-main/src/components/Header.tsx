import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { languages, currencies } from "@/lib/i18n";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  const { t, lang, setLang, currency, setCurrency } = useApp();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-3">
        <Link to="/" className="flex items-center" aria-label="Vura">
          <Logo className="text-2xl md:text-3xl" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary-foreground transition">{t("home")}</Link>
          <Link to="/search" search={{ q: "", category: "" }} className="hover:text-primary-foreground transition">{t("search")}</Link>
          <Link to="/cart" className="hover:text-primary-foreground transition">{t("cart")}</Link>
          <Link to="/account" className="hover:text-primary-foreground transition">{t("account")}</Link>
          {isAdmin && (
            <Link to="/admin" className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
              {t("admin")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
              {languages.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                  <span className={lang === l.code ? "font-bold" : ""}>{l.native}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("currency")}</DropdownMenuLabel>
              {currencies.map((c) => (
                <DropdownMenuItem key={c.code} onClick={() => setCurrency(c.code)}>
                  <span className={currency === c.code ? "font-bold" : ""}>
                    {c.symbol} {c.code}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {!user && (
            <Link to="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t("signIn")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
