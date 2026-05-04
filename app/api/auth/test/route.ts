import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@utilityhub.local",
    password: "UtilityHub2026!",
  })

  return NextResponse.json({
    success: !error,
    error:   error?.message ?? null,
    userId:  data?.user?.id ?? null,
    env: {
      urlSet:     !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue:   process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + "...",
    },
  })
}
