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
        className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[9%] border border-[oklch(0.48_0.07_55/55%)] px-[8%] pb-[8%] pt-[7%]"
        style={{
          background:
            "repeating-linear-gradient(92deg, transparent 0 11%, oklch(0.18 0.035 45 / 20%) 12% 13%, transparent 14% 25%), linear-gradient(165deg, oklch(0.36 0.07 57) 0%, oklch(0.24 0.055 48) 48%, oklch(0.16 0.032 40) 100%)",
          boxShadow:
            "0 12px 18px -8px oklch(0 0 0 / 85%), inset 0 1px 0 oklch(0.72 0.08 72 / 42%), inset 0 -2px 4px oklch(0.08 0.02 40 / 55%)",
        }}
      >
        <div className="absolute inset-x-[8%] top-[9%] bottom-[15%] rounded-[7%] border border-[oklch(0.08_0.01_45/75%)] bg-[oklch(0.105_0.014_45/92%)] shadow-[inset_0_2px_5px_oklch(0_0_0/80%)]" />
        <div className="relative flex items-baseline justify-center gap-[2px] font-mono text-[clamp(0.66rem,1.45vw,1.35rem)] font-semibold leading-none tabular-nums text-[oklch(0.84_0.15_72)] [text-shadow:0_0_8px_oklch(0.8_0.16_68/72%)]">
          <span>{hh}</span>
          <span className="animate-pulse opacity-80">:</span>
          <span>{mm}</span>
          <span className="ml-[2px] text-[0.5em] opacity-65">{ss}</span>
        </div>
        <div className="relative mt-[6%] flex w-[68%] items-center justify-between text-[clamp(0.18rem,0.36vw,0.36rem)] uppercase tracking-[0.12em] text-[oklch(0.7_0.075_72/68%)]">
          <span>desk</span>
          <span className="size-[3px] rounded-full bg-[oklch(0.76_0.14_72)] shadow-[0_0_5px_oklch(0.78_0.15_70/80%)]" />
        </div>
        <span className="absolute bottom-[-3%] left-[14%] h-[8%] w-[12%] rounded-b-sm bg-[oklch(0.12_0.025_42)]" />
        <span className="absolute bottom-[-3%] right-[14%] h-[8%] w-[12%] rounded-b-sm bg-[oklch(0.12_0.025_42)]" />
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
