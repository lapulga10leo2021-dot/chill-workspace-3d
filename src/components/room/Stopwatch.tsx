import { useEffect, useRef, useState } from "react";
import { Pause, Play, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function Stopwatch({ onSave }: { onSave?: (minutes: number) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed;
    const id = window.setInterval(() => setElapsed(Date.now() - startRef.current), 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-display text-3xl tabular-nums">{fmt(elapsed)}</div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? "Tạm dừng" : "Bắt đầu"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
          }}
        >
          <RotateCcw className="size-4" />
        </Button>
        {onSave && (
          <Button
            size="sm"
            disabled={elapsed < 60_000}
            onClick={() => {
              onSave(elapsed / 60000);
              setRunning(false);
              setElapsed(0);
            }}
          >
            <Save className="size-4" /> Lưu phiên
          </Button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">Lưu phiên từ 1 phút trở lên vào thống kê</p>
    </div>
  );
}
