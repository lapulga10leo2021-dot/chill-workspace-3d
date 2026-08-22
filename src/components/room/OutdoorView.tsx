import type { Weather } from "./WeatherLayer";

/** Ô kính được mô tả bằng đa giác (theo % khung 16/9) để khớp phối cảnh cửa sổ. */
export type GlassPane = { points: [number, number][] };

const SKY: Record<Weather, string> = {
  clear:
    "linear-gradient(180deg, oklch(0.78 0.11 235) 0%, oklch(0.86 0.08 220) 45%, oklch(0.9 0.09 90) 100%)",
  rain:
    "linear-gradient(180deg, oklch(0.42 0.04 250) 0%, oklch(0.5 0.04 245) 55%, oklch(0.56 0.03 240) 100%)",
  snow:
    "linear-gradient(180deg, oklch(0.6 0.03 250) 0%, oklch(0.74 0.02 250) 60%, oklch(0.85 0.01 250) 100%)",
  autumn:
    "linear-gradient(180deg, oklch(0.62 0.08 60) 0%, oklch(0.72 0.11 65) 55%, oklch(0.8 0.12 75) 100%)",
  night:
    "linear-gradient(180deg, oklch(0.2 0.04 275) 0%, oklch(0.26 0.05 285) 60%, oklch(0.33 0.06 300) 100%)",
};

/** Dải nhà cửa xa xa (vẽ bằng gradient, không dùng ảnh). */
const SKYLINE: Record<Weather, string> = {
  clear: "oklch(0.55 0.05 250 / 70%)",
  rain: "oklch(0.3 0.03 255 / 80%)",
  snow: "oklch(0.5 0.02 255 / 70%)",
  autumn: "oklch(0.4 0.05 45 / 75%)",
  night: "oklch(0.14 0.03 280 / 88%)",
};

const PRECIP: Partial<Record<Weather, { image: string; size: string; duration: string; opacity: number }>> = {
  rain: {
    image:
      "repeating-linear-gradient(100deg, transparent 0 6px, oklch(0.92 0.02 250 / 55%) 6px 7px), repeating-linear-gradient(97deg, transparent 0 11px, oklch(0.92 0.02 250 / 30%) 11px 12px)",
    size: "auto",
    duration: "0.8s",
    opacity: 0.55,
  },
  snow: {
    image:
      "radial-gradient(circle at 20% 20%, oklch(0.99 0.01 260 / 90%) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, oklch(0.99 0.01 260 / 70%) 0 2.5px, transparent 3px)",
    size: "120px 160px, 190px 220px",
    duration: "7s",
    opacity: 0.8,
  },
  autumn: {
    image:
      "radial-gradient(circle at 25% 25%, oklch(0.75 0.14 60 / 90%) 0 3px, transparent 4px), radial-gradient(circle at 68% 60%, oklch(0.66 0.16 40 / 80%) 0 3.5px, transparent 4px)",
    size: "150px 200px, 240px 260px",
    duration: "9s",
    opacity: 0.85,
  },
};

/**
 * Khung cảnh ngoài trời nằm *sau* ô kính: bầu trời + dải nhà xa + mưa/tuyết/lá rơi
 * chỉ xuất hiện trong vùng kính (clip-path theo phối cảnh khung cửa), làm mờ nhẹ
 * và tối đi để cảm giác ở xa, phía ngoài phòng.
 */
export function OutdoorView({ weather, panes }: { weather: Weather; panes: GlassPane[] }) {
  const precip = PRECIP[weather];

  return (
    <>
      {panes.map((pane, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: `polygon(${pane.points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`,
          }}
        >
          {/* Trời + nhà xa */}
          <div
            key={weather}
            className="absolute inset-0 animate-[fade-in_700ms_ease-out]"
            style={{
              background: SKY[weather],
              mixBlendMode: "soft-light",
              opacity: 0.92,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${SKYLINE[weather]} 0 26px, transparent 26px 34px, ${SKYLINE[weather]} 34px 52px, transparent 52px 66px)`,
              maskImage: "linear-gradient(180deg, transparent 42%, black 62%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 42%, black 62%)",
              filter: "blur(3px)",
              mixBlendMode: "multiply",
              opacity: 0.45,
            }}
          />
          {/* Mưa / tuyết / lá rơi — chỉ trong vùng kính */}
          {precip && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: precip.image,
                backgroundSize: precip.size,
                opacity: precip.opacity,
                mixBlendMode: "screen",
                filter: "blur(0.3px)",
                animation: `rain-fall ${precip.duration} linear infinite`,
              }}
            />
          )}
          {/* Kính: phản chiếu + tối viền để cảnh nằm sau cửa sổ */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, oklch(0.98 0.01 250 / 7%) 0%, transparent 32%, oklch(0.98 0.01 250 / 4%) 60%, transparent 78%), radial-gradient(120% 120% at 50% 45%, transparent 45%, oklch(0.1 0.02 280 / 60%) 100%)",
            }}
          />
        </div>
      ))}
    </>
  );
}
