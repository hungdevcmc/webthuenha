"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/form-fields";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes("invalid")
            ? "Email hoặc mật khẩu không đúng."
            : `Không đăng nhập được: ${signInError.message}`,
        );
        return;
      }
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        setError("Tài khoản này chưa được cấp quyền quản trị.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@example.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="password" required>
          Mật khẩu
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <FieldError id="login-error" message={error ?? undefined} />
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        <LogIn className="size-5" aria-hidden="true" />
        {busy ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}
