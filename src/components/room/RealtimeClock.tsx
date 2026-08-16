import { useEffect, useState } from "react";

export function RealtimeClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now
    ? now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })
    : "";

  return (
    <div className="text-center">
      <div
        className={`font-display tabular-nums ${compact ? "text-2xl" : "text-5xl"} text-warm-gradient`}
      >
        {time}
      </div>
      {!compact && <div className="mt-1 text-xs capitalize text-muted-foreground">{date}</div>}
    </div>
  );
}
