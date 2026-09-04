"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({ compact, email }: { compact?: boolean; email?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Không đăng xuất được. Vui lòng thử lại.");
      setBusy(false);
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Button
      variant={compact ? "ghost" : "secondary"}
      size="sm"
      onClick={signOut}
      disabled={busy}
      title={email ? `Đăng xuất (${email})` : "Đăng xuất"}
      aria-label={email ? `Đăng xuất khỏi ${email}` : "Đăng xuất"}
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span className={compact ? "hidden sm:inline" : undefined}>{busy ? "Đang thoát…" : "Đăng xuất"}</span>
    </Button>
  );
}
