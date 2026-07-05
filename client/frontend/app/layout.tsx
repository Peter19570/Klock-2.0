import { Outfit, JetBrains_Mono, Geist } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

const noFlashThemeScript = `
(function () {
  var authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
  var isAuthRoute = authRoutes.some(function (p) { return window.location.pathname.startsWith(p); });
  if (isAuthRoute) {
    document.documentElement.classList.add("dark");
    return;
  }
  try {
    var stored = localStorage.getItem("klock-theme") || "system";
    var isDark = stored === "dark" || (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(outfit.variable, jetbrainsMono.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}