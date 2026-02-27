"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/Admin/dashboard");
      }
    });
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/Admin/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#0B1D3A] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#C5A55A] uppercase">Admin Access</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Login to Admin Panel</h1>
            <p className="mt-2 text-sm text-white/60">Sign in first to open the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-white/90">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/35 focus-visible:ring-[#C5A55A]/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-white/90">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/35 focus-visible:ring-[#C5A55A]/50"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-white/50">Sign in with your Supabase Auth credentials.</p>
        </div>
      </div>
    </main>
  );
}
