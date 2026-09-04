import type { Weather } from "./WeatherLayer";

/** Ô kính được mô tả bằng đa giác (theo % khung 16/9) để khớp phối cảnh cửa sổ. */
export type GlassPane = { points: [number, number][] };

type Scene = {
  /** ánh sáng ngoài trời: làm sáng cảnh thật phía sau kính */
  light: string;
  lightOpacity: number;
  /** sắc trời: nhuộm màu cảnh cho đúng thời tiết */
  tint: string;
  tintOpacity: number;
};

const SCENES: Record<Weather, Scene> = {
  clear: {
    light:
      "linear-gradient(180deg, oklch(0.72 0.09 235) 0%, oklch(0.8 0.07 210) 55%, oklch(0.86 0.1 90) 100%)",
    lightOpacity: 0.62,
    tint: "linear-gradient(180deg, oklch(0.7 0.12 230) 0%, oklch(0.82 0.12 95) 100%)",
    tintOpacity: 0.6,
  },
  rain: {
    light: "linear-gradient(180deg, oklch(0.5 0.04 255) 0%, oklch(0.58 0.03 245) 100%)",
    lightOpacity: 0.16,
    tint: "linear-gradient(180deg, oklch(0.45 0.06 255) 0%, oklch(0.5 0.05 245) 100%)",
    tintOpacity: 0.45,
  },
  snow: {
    light:
      "linear-gradient(180deg, oklch(0.66 0.02 250) 0%, oklch(0.78 0.015 250) 60%, oklch(0.88 0.01 250) 100%)",
    lightOpacity: 0.5,
    tint: "linear-gradient(180deg, oklch(0.7 0.03 245) 0%, oklch(0.85 0.02 250) 100%)",
    tintOpacity: 0.55,
  },
  autumn: {
    light:
      "linear-gradient(180deg, oklch(0.6 0.07 40) 0%, oklch(0.7 0.1 55) 55%, oklch(0.78 0.12 72) 100%)",
    lightOpacity: 0.45,
    tint: "linear-gradient(180deg, oklch(0.55 0.13 40) 0%, oklch(0.72 0.14 70) 100%)",
    tintOpacity: 0.6,
  },
  night: {
    light: "linear-gradient(180deg, oklch(0.3 0.05 285) 0%, oklch(0.38 0.06 300) 100%)",
    lightOpacity: 0.08,
    tint: "linear-gradient(180deg, oklch(0.24 0.06 285) 0%, oklch(0.32 0.07 300) 100%)",
    tintOpacity: 0.4,
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
            {/* Ánh sáng ngoài trời (làm sáng cảnh thật) */}
            <div
              key={`l-${weather}`}
              className="pointer-events-none absolute inset-0 animate-[fade-in_700ms_ease-out]"
              style={{
                clipPath,
                background: scene.light,
                opacity: scene.lightOpacity,
                mixBlendMode: "screen",
              }}
            />
            {/* Sắc trời */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                clipPath,
                background: scene.tint,
                opacity: scene.tintOpacity,
                mixBlendMode: "color",
              }}
            />
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
