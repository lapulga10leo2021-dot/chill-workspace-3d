import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import roomNight from "@/assets/room-night.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Lofi Deskspace" },
      {
        name: "description",
        content:
          "Đăng nhập để mở phòng làm việc lofi của riêng bạn: nhạc chill, đồng hồ tập trung và thư viện tài liệu.",
      },
      { property: "og:title", content: "Đăng nhập — Lofi Deskspace" },
      {
        property: "og:description",
        content: "Mở phòng làm việc lofi của riêng bạn với nhạc chill và đồng hồ tập trung.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/desk", replace: true });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSentConfirm(true);
          toast.success("Đã gửi email xác nhận, kiểm tra hộp thư nhé!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Không đăng nhập được bằng Google");
      return;
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <img
        src={roomNight}
        alt="Phòng làm việc lofi ban đêm với đèn bàn ấm và mưa ngoài cửa sổ"
        width={1920}
        height={1088}
        className="absolute inset-0 size-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-background/70" />

      <section className="glass-panel relative w-full max-w-md rounded-2xl p-7">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Về trang giới thiệu
        </Link>
        <h1 className="mt-4 text-2xl">
          {mode === "signin" ? "Trở lại phòng của bạn" : "Tạo phòng làm việc"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhạc mưa rơi, piano nhẹ và đồng hồ tập trung đang đợi bạn.
        </p>

        {sentConfirm ? (
          <p className="mt-6 rounded-lg bg-secondary p-4 text-sm">
            Hãy mở email <strong>{email}</strong> và bấm liên kết xác nhận để hoàn tất đăng ký.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Tên hiển thị</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signin" ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> hoặc <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" className="w-full" onClick={google}>
          Tiếp tục với Google
        </Button>

        <button
          type="button"
          className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setSentConfirm(false);
          }}
        >
          {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
        </button>
      </section>
    </main>
  );
}
