import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Protect /dashboard and /pasien/* (except /pasien/qr/*)
        const path = req.nextUrl.pathname;
        if (
          path.startsWith("/dashboard") ||
          (path.startsWith("/pasien") && !path.startsWith("/pasien/qr"))
        ) {
          return token !== null;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/pasien/:path*"],
};
