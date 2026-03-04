"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "@/modules/layout/nav";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing authentication token");
      return;
    }

    document.cookie = `rmb_session=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax; secure`;
    router.push("/dashboard");
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-red-400">{error}</p>
        <a
          href="/login"
          className="text-sm text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
        >
          back to login
        </a>
      </div>
    );
  }

  return (
    <p className="font-mono text-sm text-muted-foreground">
      signing you in...
    </p>
  );
}

export default function AuthCallbackPage() {
  return (
    <>
      <Nav />
      <main className="flex min-h-screen items-center justify-center px-6">
        <Suspense
          fallback={
            <p className="font-mono text-sm text-muted-foreground">
              loading...
            </p>
          }
        >
          <CallbackContent />
        </Suspense>
      </main>
    </>
  );
}
