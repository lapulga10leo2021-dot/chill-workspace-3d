import { useEffect, useState } from "react";

/** Đồng hồ điện tử để bàn: vỏ tối, số LED phát sáng. */
export function RealtimeClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";
  const date = now
    ? now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })
    : "";

  if (compact) {
    return (
      <div
        className="rounded-[18%] border border-white/10 bg-[oklch(0.18_0.02_270)] px-[6%] py-[4%] shadow-[0_6px_18px_-6px_oklch(0_0_0/60%)]"
        role="timer"
        aria-label={`Đồng hồ điện tử ${hh}:${mm}`}
      >
        <div className="flex items-baseline justify-center gap-[2px] font-mono text-[clamp(0.7rem,1.5vw,1.4rem)] leading-none tabular-nums text-[oklch(0.85_0.16_75)] [text-shadow:0_0_8px_oklch(0.8_0.18_70/70%)]">
          <span>{hh}</span>
          <span className="animate-pulse">:</span>
          <span>{mm}</span>
          <span className="text-[0.55em] opacity-80">{ss}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="font-mono text-5xl tabular-nums text-warm-gradient">
        {hh}:{mm}:{ss}
      </div>
      <div className="mt-1 text-xs capitalize text-muted-foreground">{date}</div>
    </div>
  );
}
