import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const LOCALE_PREFIX = /^\/(en|mk|de|sq)/;

export async function updateSession(
  request: NextRequest,
  intlResponse?: NextResponse
) {
  let supabaseResponse =
    intlResponse ??
    NextResponse.next({
      request,
    });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          // Preserve any headers set by next-intl middleware
          if (intlResponse) {
            intlResponse.headers.forEach((value, key) => {
              supabaseResponse.headers.set(key, value);
            });
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const protectedPaths = [
    "/dashboard",
    "/calendar",
    "/goals",
    "/stats",
    "/settings",
    "/onboarding",
  ];

  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(LOCALE_PREFIX, "");
  const isProtected = protectedPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );

  if (isProtected && !user) {
    const localeMatch = pathname.match(LOCALE_PREFIX);
    const locale = localeMatch ? localeMatch[1] : "en";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
