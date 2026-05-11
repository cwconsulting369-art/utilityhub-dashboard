import { type NextRequest, NextResponse } from "next/server"
import { createClient }        from "@supabase/supabase-js"
import { updateSession }       from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAppRoute            = pathname.startsWith("/app")
  const isPortalRoute         = pathname.startsWith("/portal")
  const isLoginPage           = pathname === "/login"
  const isChangePasswordPage  = pathname === "/portal/change-password"

  // Unauthenticated → login
  if (!user && (isAppRoute || isPortalRoute)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Authenticated on login page → /app/dashboard
  // (layout handles customer → /portal redirect)
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url))
  }

  // Forced password change for customer accounts on first login.
  // Uses service-role client because the customer-role RLS doesn't expose
  // password_changed via the user's session token.
  if (user && isPortalRoute && !isChangePasswordPage) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await admin
      .from("profiles")
      .select("role, password_changed")
      .eq("id", user.id)
      .single()
    if (profile?.role === "customer" && profile.password_changed === false) {
      return NextResponse.redirect(new URL("/portal/change-password", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png).*)"],
}
