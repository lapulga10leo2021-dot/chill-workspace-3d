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
      <div className="relative w-full pb-[8%] [perspective:260px]">
        <div className="absolute bottom-0 left-[8%] right-[4%] h-[16%] rounded-[50%] bg-[oklch(0.03_0.006_40/78%)] blur-[4px]" />
        <div
          role="timer"
          aria-label={`Đồng hồ điện tử ${hh}:${mm}`}
          className="relative aspect-[2.25/1] w-full overflow-hidden rounded-[8%_7%_9%_8%] border border-[oklch(0.47_0.075_58/58%)] [transform:rotateY(-3deg)_rotateX(1deg)]"
          style={{
            background:
              "repeating-linear-gradient(96deg, transparent 0 8%, oklch(0.16 0.03 44 / 23%) 8.5% 9.5%, transparent 10% 20%), linear-gradient(170deg, oklch(0.4 0.075 58) 0%, oklch(0.27 0.06 49) 48%, oklch(0.155 0.033 39) 100%)",
            boxShadow:
              "8px 9px 12px -7px oklch(0 0 0 / 92%), inset 0 1px 0 oklch(0.73 0.08 72 / 46%), inset -5px -6px 8px oklch(0.08 0.018 38 / 45%)",
          }}
        >
          <div className="absolute inset-x-[7%] bottom-[16%] top-[14%] rounded-[6%] border border-[oklch(0.08_0.01_45/86%)] bg-[oklch(0.085_0.01_42/96%)] shadow-[inset_0_3px_7px_oklch(0_0_0/90%),0_1px_0_oklch(0.67_0.07_68/30%)]" />
          <div className="absolute inset-x-[9%] top-[18%] h-[14%] rounded-full bg-[linear-gradient(180deg,oklch(0.9_0.02_75/7%),transparent)]" />
          <div className="relative flex h-full items-center justify-center pb-[4%] font-mono text-[clamp(0.62rem,1.28vw,1.2rem)] font-semibold leading-none tabular-nums text-[oklch(0.82_0.15_70)] [text-shadow:0_0_5px_oklch(0.78_0.16_65/65%)]">
            <span>{hh}</span>
            <span className="mx-[2px] animate-pulse opacity-75">:</span>
            <span>{mm}</span>
            <span className="ml-[5%] text-[0.42em] opacity-55">{ss}</span>
          </div>
          <span className="absolute bottom-[7%] right-[9%] size-[2.5%] rounded-full bg-[oklch(0.78_0.145_69)] shadow-[0_0_4px_oklch(0.78_0.15_68/75%)]" />
        </div>
        <span className="absolute bottom-[4%] left-[15%] h-[8%] w-[13%] rounded-b-sm bg-[oklch(0.105_0.022_38)]" />
        <span className="absolute bottom-[4%] right-[12%] h-[8%] w-[13%] rounded-b-sm bg-[oklch(0.105_0.022_38)]" />
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
