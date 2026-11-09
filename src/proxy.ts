// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Cek apakah user punya Cookie sesi
  const session = req.cookies.get("user_session");
  const isLoggedIn = !!session;

  // 2. Aturan Satpam:
  // Jika mengakses /dashboard tapi BELUM login -> tendang ke /login
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Jika sudah login tapi mencoba buka /login -> arahkan ke /dashboard
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 4. Jika lolos aturan di atas, persilakan masuk
  return NextResponse.next();
}

// Matcher menentukan halaman mana saja yang dicek oleh satpam ini
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};