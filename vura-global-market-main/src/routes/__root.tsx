import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vura — Global Marketplace" },
      { name: "description", content: "Shop the world on Vura. Discover deals on electronics, fashion, beauty, and more with global shipping." },
      { property: "og:title", content: "Vura — Global Marketplace" },
      { property: "og:description", content: "Shop the world on Vura. Discover deals on electronics, fashion, beauty, and more with global shipping." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Vura — Global Marketplace" },
      { name: "twitter:description", content: "Shop the world on Vura. Discover deals on electronics, fashion, beauty, and more with global shipping." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b17bcfdb-6a76-4e0c-a156-812ab56f5440/id-preview-b816ae4d--4b6d5a47-0284-4b9d-a2c1-4660a91686de.lovable.app-1777744895138.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b17bcfdb-6a76-4e0c-a156-812ab56f5440/id-preview-b816ae4d--4b6d5a47-0284-4b9d-a2c1-4660a91686de.lovable.app-1777744895138.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&display=swap" }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          <Header />
          <Outlet />
          <BottomNav />
          <Toaster position="top-center" richColors />
        </div>
      </AuthProvider>
    </AppProvider>
  );
}
