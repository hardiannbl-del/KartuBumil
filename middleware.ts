import { auth } from "@/lib/auth";

export default auth((req: any) => {
  const path = req.nextUrl.pathname;
  
  if (
    path.startsWith("/dashboard") ||
    (path.startsWith("/pasien") && !path.startsWith("/pasien/qr"))
  ) {
    if (!req.auth) {
      const url = new URL("/login", req.url);
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
