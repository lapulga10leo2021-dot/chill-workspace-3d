import type React from "react";
import type { Weather } from "./WeatherLayer";

/** Ô kính được mô tả bằng đa giác (theo % khung 16/9) để khớp phối cảnh cửa sổ. */
export type GlassPane = { points: [number, number][] };

type Scene = {
  /** lọc chính khung cảnh thật phía sau kính (sáng/độ bão hoà/màu) */
  filter: string;
  /** sắc trời phủ nhẹ lên cảnh */
  tint: string;
  tintOpacity: number;
};

const SCENES: Record<Weather, Scene> = {
  clear: {
    filter: "blur(2.5px) brightness(1.9) saturate(0.85) hue-rotate(-12deg)",
    tint: "linear-gradient(180deg, oklch(0.78 0.09 235) 0%, oklch(0.86 0.07 205) 55%, oklch(0.9 0.09 92) 100%)",
    tintOpacity: 0.4,
  },
  rain: {
    filter: "blur(1.2px) brightness(1.05) saturate(0.95)",
    tint: "linear-gradient(180deg, oklch(0.45 0.05 255) 0%, oklch(0.5 0.04 245) 100%)",
    tintOpacity: 0.14,
  },
  snow: {
    filter: "blur(3px) brightness(1.6) saturate(0.35)",
    tint: "linear-gradient(180deg, oklch(0.8 0.02 250) 0%, oklch(0.9 0.015 250) 100%)",
    tintOpacity: 0.34,
  },
  autumn: {
    filter: "blur(2.5px) brightness(1.35) saturate(1.15) hue-rotate(28deg)",
    tint: "linear-gradient(180deg, oklch(0.6 0.1 40) 0%, oklch(0.75 0.12 70) 100%)",
    tintOpacity: 0.32,
  },
  night: {
    filter: "blur(1.5px) brightness(0.72) saturate(0.9)",
    tint: "linear-gradient(180deg, oklch(0.24 0.06 285) 0%, oklch(0.3 0.07 300) 100%)",
    tintOpacity: 0.24,
  },
};

const PRECIP: Partial<
  Record<Weather, { image: string; size: string; duration: string; opacity: number }>
> = {
  rain: {
    image:
      "repeating-linear-gradient(100deg, transparent 0 6px, oklch(0.95 0.02 250 / 45%) 6px 7px), repeating-linear-gradient(97deg, transparent 0 11px, oklch(0.95 0.02 250 / 24%) 11px 12px)",
    size: "auto",
    duration: "0.8s",
    opacity: 0.45,
  },
  snow: {
    image:
      "radial-gradient(circle at 20% 20%, oklch(0.99 0.01 260 / 92%) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, oklch(0.99 0.01 260 / 70%) 0 2.5px, transparent 3px)",
    size: "110px 150px, 180px 210px",
    duration: "7s",
    opacity: 0.8,
  },
  autumn: {
    image:
      "radial-gradient(circle at 25% 25%, oklch(0.72 0.14 60 / 92%) 0 3px, transparent 4px), radial-gradient(circle at 68% 60%, oklch(0.62 0.16 40 / 82%) 0 3.5px, transparent 4px)",
    size: "140px 190px, 230px 250px",
    duration: "9s",
    opacity: 0.85,
  },
};

function clip(pane: GlassPane) {
  return `polygon(${pane.points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}

/**
 * Đổi khung cảnh *phía sau* ô kính: các lớp ánh sáng / sắc trời hoà vào chính
 * khung cảnh thành phố có sẵn trong tranh (không chèn ảnh), và mưa/tuyết/lá rơi
 * chỉ diễn ra trong vùng kính nên luôn ở ngoài phòng.
 */
export function OutdoorView({ weather, panes }: { weather: Weather; panes: GlassPane[] }) {
  const scene = SCENES[weather];
  const precip = PRECIP[weather];

  return (
    <>
      {panes.map((pane, i) => {
        const clipPath = clip(pane);
        return (
          <div key={i} aria-hidden className="contents">
            {/* Khung cảnh ngoài trời: lọc & nhuộm chính cảnh thật sau kính */}
            <div
              key={`s-${weather}`}
              className="pointer-events-none absolute inset-0 animate-[fade-in_700ms_ease-out]"
              style={
                {
                  clipPath,
                  backdropFilter: scene.filter,
                } as React.CSSProperties
              }
            >
              <div
                className="absolute inset-0"
                style={{ background: scene.tint, opacity: scene.tintOpacity }}
              />
            </div>

            {/* Mưa / tuyết / lá rơi — chỉ ngoài cửa sổ */}
            {precip && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  clipPath,
                  backgroundImage: precip.image,
                  backgroundSize: precip.size,
                  opacity: precip.opacity,
                  animation: `rain-fall ${precip.duration} linear infinite`,
                }}
              />
            )}
            {/* Kính: phản chiếu nhẹ + tối viền */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                clipPath,
                background:
                  "linear-gradient(115deg, oklch(0.98 0.01 250 / 8%) 0%, transparent 30%, oklch(0.98 0.01 250 / 4%) 58%, transparent 76%), radial-gradient(130% 130% at 50% 40%, transparent 48%, oklch(0.1 0.02 280 / 45%) 100%)",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
