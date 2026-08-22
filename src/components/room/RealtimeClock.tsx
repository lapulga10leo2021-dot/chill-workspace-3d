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
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const todayIdx = now ? (now.getDay() + 6) % 7 : -1;
    return (
      <div
        className="flex items-stretch gap-[4%] rounded-[14%] border border-white/15 bg-[oklch(0.16_0.01_270)] px-[5%] py-[4%] shadow-[0_6px_18px_-6px_oklch(0_0_0/70%),0_2px_0_oklch(0.72_0.16_75/70%)_inset]"
        role="timer"
        aria-label={`Đồng hồ điện tử ${hh}:${mm}`}
      >
        <div className="flex items-center justify-center gap-[2px] font-mono text-[clamp(0.75rem,1.7vw,1.6rem)] font-bold leading-none tabular-nums text-[oklch(0.82_0.2_155)] [text-shadow:0_0_8px_oklch(0.8_0.2_155/70%)]">
          <span>{hh}</span>
          <span className="animate-pulse">:</span>
          <span>{mm}</span>
        </div>
        <div className="flex flex-col justify-between py-[1%] text-[clamp(0.2rem,0.42vw,0.4rem)] leading-none tracking-tight">
          {days.map((d, i) => (
            <span
              key={d}
              className={
                i === todayIdx
                  ? "text-[oklch(0.82_0.2_155)]"
                  : "text-[oklch(0.98_0_0)] opacity-70"
              }
            >
              {d}
            </span>
          ))}
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
