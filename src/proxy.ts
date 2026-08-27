import { NextResponse, type NextRequest } from "next/server";

const frontendOnly = process.env.FRONTEND_ONLY === "1";

export function proxy(request: NextRequest) {
  if (frontendOnly) {
    return new NextResponse("Página não encontrada.", {
      status: 404,
      headers: {
        "cache-control": "public, max-age=60",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/acesso-administrativo", "/api/:path*", "/uploads/:path*"],
};
