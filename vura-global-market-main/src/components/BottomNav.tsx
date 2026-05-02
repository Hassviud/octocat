import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useApp();
  const location = useLocation();
  const items = [
    { to: "/", icon: Home, label: t("home") },
    { to: "/search", icon: Search, label: t("search") },
    { to: "/cart", icon: ShoppingBag, label: t("cart") },
    { to: "/account", icon: User, label: t("account") },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md shadow-soft md:hidden">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-full transition-all",
                active ? "bg-primary px-4 py-1.5 shadow-glow" : "p-1.5"
              )}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn("text-[10px] font-medium", active && "text-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
