import { useEffect, useState } from "react";

/** Đồng hồ điện tử để bàn: vỏ gỗ tối, số LED hổ phách ấm cho khớp phòng lofi. */
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
        role="timer"
        aria-label={`Đồng hồ điện tử ${hh}:${mm}`}
        className="flex w-full flex-col items-center justify-center gap-[2%] rounded-[12%] border border-[oklch(0.45_0.05_60/45%)] px-[6%] py-[7%]"
        style={{
          background:
            "linear-gradient(165deg, oklch(0.24 0.03 55) 0%, oklch(0.16 0.02 40) 100%)",
          boxShadow:
            "0 10px 22px -10px oklch(0 0 0 / 75%), inset 0 1px 0 oklch(0.7 0.06 70 / 35%)",
        }}
      >
        <div className="flex items-baseline justify-center gap-[2px] font-mono text-[clamp(0.7rem,1.6vw,1.5rem)] font-semibold leading-none tabular-nums text-[oklch(0.83_0.15_70)] [text-shadow:0_0_10px_oklch(0.78_0.16_65/65%)]">
          <span>{hh}</span>
          <span className="animate-pulse opacity-80">:</span>
          <span>{mm}</span>
          <span className="ml-[3px] text-[0.55em] opacity-70">{ss}</span>
        </div>
        <div className="text-[clamp(0.22rem,0.5vw,0.5rem)] uppercase tracking-[0.25em] text-[oklch(0.72_0.09_70/70%)]">
          focus
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
