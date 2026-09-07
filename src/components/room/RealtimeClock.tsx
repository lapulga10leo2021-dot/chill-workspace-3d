import { useEffect, useState } from "react";

/** Đồng hồ điện tử để bàn: khối gỗ óc chó, mặt kính chìm và LED hổ phách. */
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
      <div className="relative w-full pb-[5%] [perspective:260px]">
        <div className="absolute bottom-0 left-[7%] right-[2%] h-[18%] rounded-[50%] bg-[oklch(0.03_0.006_40/72%)] blur-[3px]" />
        <div
          role="timer"
          aria-label={`Đồng hồ điện tử ${hh}:${mm}`}
          className="relative aspect-[2.28/1] w-full overflow-hidden rounded-[12%] border border-[oklch(0.45_0.07_55/52%)] [transform:rotateY(-4deg)_rotateX(1deg)]"
          style={{
            background:
              "repeating-linear-gradient(4deg, transparent 0 11%, oklch(0.12 0.025 42 / 24%) 11.5% 12.4%, transparent 13% 24%), linear-gradient(165deg, oklch(0.43 0.075 58) 0%, oklch(0.3 0.062 49) 52%, oklch(0.19 0.04 42) 100%)",
            boxShadow:
              "7px 8px 10px -6px oklch(0 0 0 / 88%), inset 0 1px 0 oklch(0.74 0.08 72 / 42%), inset -5px -5px 8px oklch(0.08 0.018 38 / 34%)",
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(112deg,transparent_0_47%,oklch(0.82_0.08_72/7%)_54%,transparent_62%)]" />
          <div className="relative flex h-full items-center justify-center pb-[2%] font-mono text-[clamp(0.58rem,1.1vw,1.05rem)] font-medium leading-none tabular-nums text-[oklch(0.86_0.15_79)] [text-shadow:0_0_4px_oklch(0.83_0.16_72/72%)]">
            <span>{hh}</span>
            <span className="mx-[2px] animate-pulse opacity-75">:</span>
            <span>{mm}</span>
            <span className="ml-[9%] text-[0.55em] opacity-80">{ss}</span>
          </div>
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
