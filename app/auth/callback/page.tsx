"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    async function completeLogin() {
      const authError = searchParams.get("error");
      const errorCode = searchParams.get("error_code");
      if (authError || errorCode) {
        const isExpired = errorCode === "otp_expired";
        router.replace(
          isExpired ? "/admin/login?error=expired" : "/admin/login?error=auth"
        );
        return;
      }

      const supabase = createClient();
      const next = searchParams.get("next") || "/admin";
      const safeNext = next.startsWith("/") ? next : "/admin";

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(safeNext);
          return;
        }
        setMessage(error.message);
        router.replace("/admin/login?error=auth");
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error) {
          router.replace(safeNext);
          return;
        }
        setMessage(error.message);
        router.replace("/admin/login?error=auth");
        return;
      }

      const hash = window.location.hash.replace(/^#/, "");
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!error) {
            router.replace(safeNext);
            return;
          }
        }
      }

      router.replace("/admin/login?error=auth");
    }

    completeLogin();
  }, [router, searchParams]);

  return (
    <main>
      <section className="collection">
        <div className="collection__inner">
          <p className="about__text">{message}</p>
        </div>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="about__text">Loading…</p>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
