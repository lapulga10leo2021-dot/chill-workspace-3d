import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Khớp toạ độ vật dụng với ảnh nền dạng object-cover.
 * Ảnh nền gốc tỉ lệ 16/9 (1920x1080) nên hotspot dùng % theo khung 16/9.
 */
export function RoomStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const scale = Math.max(width / 1920, height / 1080);
      setBox({ w: 1920 * scale, h: 1080 * scale });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: box.w || "100%", height: box.h || "100%" }}
      >
        {children}
      </div>
    </div>
  );
}

type HotspotProps = {
  label: string;
  /** vùng bấm theo % của khung 16/9 */
  area: { left: number; top: number; width: number; height: number };
  onClick: () => void;
  children?: ReactNode;
};

export function Hotspot({ label, area, onClick, children }: HotspotProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group pointer-events-auto absolute rounded-2xl outline-none transition-[box-shadow,background-color] duration-300 hover:bg-primary/10 hover:shadow-[0_0_60px_-10px_var(--glow)] focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        left: `${area.left}%`,
        top: `${area.top}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
      }}
    >
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-popover/90 px-2.5 py-1 text-[11px] text-popover-foreground opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  );
}
