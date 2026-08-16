import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudRain, Clock, Music, FolderOpen, BarChart3, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import roomNight from "@/assets/room-night.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lofi Deskspace — Phòng làm việc ảo giúp tập trung" },
      {
        name: "description",
        content:
          "Phòng làm việc ảo với nền động, tiếng mưa và piano chill, đồng hồ thời gian thực, đồng hồ bấm giờ, playlist nhạc và thư viện tài liệu riêng.",
      },
      { property: "og:title", content: "Lofi Deskspace — Phòng làm việc ảo giúp tập trung" },
      {
        property: "og:description",
        content:
          "Nền động, mưa rơi hoặc piano nhẹ, đồng hồ tập trung và thư viện tài liệu — tất cả trong một phòng làm việc.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: CloudRain, title: "Cửa sổ ngoài trời", desc: "Chọn nắng, mưa, tuyết hay lá vàng rơi." },
  { icon: Clock, title: "Đồng hồ & bấm giờ", desc: "Giờ thực + stopwatch, tuỳ bạn bật/tắt." },
  { icon: Music, title: "Playlist riêng", desc: "Nhạc mưa, piano gốc hoặc nhạc bạn tải lên." },
  { icon: FolderOpen, title: "Thư viện tài liệu", desc: "PDF, Word, Excel lưu riêng tư trên cloud." },
  { icon: BarChart3, title: "Thống kê tập trung", desc: "Theo dõi số phút học/làm mỗi ngày." },
  { icon: Sofa, title: "Tự sắp xếp phòng", desc: "Chọn vật dụng và bày lên bàn làm việc." },
];

function Landing() {
  const { session } = useSession();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={roomNight}
        alt="Phòng làm việc lofi ban đêm: bàn gỗ, màn hình sáng, đèn bàn ấm, mưa ngoài cửa sổ"
        width={1920}
        height={1088}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(102deg, transparent 0 7px, oklch(0.9 0.03 250 / 45%) 7px 8px)",
          animation: "rain-fall 0.9s linear infinite",
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">lofi deskspace</p>
        <h1 className="mt-5 max-w-2xl text-4xl leading-tight sm:text-6xl">
          Phòng làm việc ảo <span className="text-warm-gradient">giúp bạn tập trung</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground">
          Bước vào một căn phòng ấm áp: mưa rơi ngoài cửa sổ, piano nhẹ, đồng hồ chạy theo thời gian
          thực và mọi tài liệu của bạn nằm gọn trên giá sách.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg" className="lamp-glow">
            <Link to={session ? "/desk" : "/auth"}>
              {session ? "Vào phòng làm việc" : "Bắt đầu miễn phí"}
            </Link>
          </Button>
          {!session && (
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Đăng nhập</Link>
            </Button>
          )}
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="glass-panel rounded-xl p-5">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-3 text-base">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
