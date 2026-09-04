import type { Weather } from "./WeatherLayer";

/** Ô kính được mô tả bằng đa giác (theo % khung 16/9) để khớp phối cảnh cửa sổ. */
export type GlassPane = { points: [number, number][] };

type Scene = {
  sky: string;
  city: string;
  /** đèn cửa sổ các toà nhà xa (chỉ cảnh tối) */
  lights: number;
  /** ánh sáng chính hắt vào phòng */
  glow: string;
};

const SCENES: Record<Weather, Scene> = {
  clear: {
    sky: "linear-gradient(180deg, oklch(0.68 0.1 240) 0%, oklch(0.76 0.08 225) 48%, oklch(0.82 0.09 85) 100%)",
    city: "oklch(0.46 0.05 250 / 85%)",
    lights: 0,
    glow: "radial-gradient(60% 55% at 72% 18%, oklch(0.92 0.09 90 / 35%), transparent 72%)",
  },
  rain: {
    sky: "linear-gradient(180deg, oklch(0.34 0.04 255) 0%, oklch(0.4 0.04 250) 55%, oklch(0.45 0.03 245) 100%)",
    city: "oklch(0.22 0.03 260 / 90%)",
    lights: 0.35,
    glow: "radial-gradient(60% 55% at 60% 20%, oklch(0.6 0.05 250 / 22%), transparent 74%)",
  },
  snow: {
    sky: "linear-gradient(180deg, oklch(0.5 0.03 255) 0%, oklch(0.62 0.02 250) 58%, oklch(0.72 0.01 250) 100%)",
    city: "oklch(0.4 0.02 255 / 85%)",
    lights: 0.28,
    glow: "radial-gradient(60% 55% at 60% 20%, oklch(0.8 0.02 250 / 26%), transparent 74%)",
  },
  autumn: {
    sky: "linear-gradient(180deg, oklch(0.46 0.07 45) 0%, oklch(0.58 0.1 55) 55%, oklch(0.68 0.12 70) 100%)",
    city: "oklch(0.3 0.05 40 / 88%)",
    lights: 0.22,
    glow: "radial-gradient(60% 55% at 66% 20%, oklch(0.8 0.12 65 / 30%), transparent 74%)",
  },
  night: {
    sky: "linear-gradient(180deg, oklch(0.16 0.04 280) 0%, oklch(0.21 0.05 288) 60%, oklch(0.27 0.06 300) 100%)",
    city: "oklch(0.11 0.03 285 / 92%)",
    lights: 0.5,
    glow: "radial-gradient(60% 55% at 62% 22%, oklch(0.45 0.07 290 / 22%), transparent 74%)",
  },
};

const PRECIP: Partial<
  Record<Weather, { image: string; size: string; duration: string; opacity: number }>
> = {
  rain: {
    image:
      "repeating-linear-gradient(100deg, transparent 0 6px, oklch(0.95 0.02 250 / 45%) 6px 7px), repeating-linear-gradient(97deg, transparent 0 11px, oklch(0.95 0.02 250 / 26%) 11px 12px)",
    size: "auto",
    duration: "0.8s",
    opacity: 0.5,
  },
  snow: {
    image:
      "radial-gradient(circle at 20% 20%, oklch(0.99 0.01 260 / 92%) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, oklch(0.99 0.01 260 / 72%) 0 2.5px, transparent 3px)",
    size: "110px 150px, 180px 210px",
    duration: "7s",
    opacity: 0.85,
  },
  autumn: {
    image:
      "radial-gradient(circle at 25% 25%, oklch(0.72 0.14 60 / 92%) 0 3px, transparent 4px), radial-gradient(circle at 68% 60%, oklch(0.62 0.16 40 / 82%) 0 3.5px, transparent 4px)",
    size: "140px 190px, 230px 250px",
    duration: "9s",
    opacity: 0.88,
  },
};

/**
 * Khung cảnh ngoài trời nằm *sau* ô kính: trời + dải nhà xa + mưa/tuyết/lá rơi,
 * vẽ hoàn toàn bằng gradient (không chèn ảnh) và bị cắt đúng vùng kính theo
 * phối cảnh khung cửa, làm mờ + tối viền để cảm giác ở ngoài phòng.
 */
export function OutdoorView({ weather, panes }: { weather: Weather; panes: GlassPane[] }) {
  const scene = SCENES[weather];
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
          {/* Trời */}
          <div
            key={weather}
            className="absolute inset-0 animate-[fade-in_700ms_ease-out]"
            style={{ background: scene.sky, filter: "blur(1px)" }}
          />
          {/* Dải nhà xa */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${scene.city} 0 22px, transparent 22px 30px, ${scene.city} 30px 44px, transparent 44px 58px, ${scene.city} 58px 92px, transparent 92px 104px)`,
              maskImage: "linear-gradient(180deg, transparent 38%, black 58%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 38%, black 58%)",
              filter: "blur(2px)",
            }}
          />
          {/* Đèn cửa sổ toà nhà xa */}
          {scene.lights > 0 && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 72%, oklch(0.9 0.1 85 / 90%) 0 1.6px, transparent 2.4px), radial-gradient(circle at 62% 80%, oklch(0.88 0.09 220 / 85%) 0 1.4px, transparent 2.2px), radial-gradient(circle at 84% 66%, oklch(0.9 0.08 95 / 80%) 0 1.5px, transparent 2.3px)",
                backgroundSize: "46px 38px, 62px 52px, 88px 44px",
                opacity: scene.lights,
                filter: "blur(0.6px)",
              }}
            />
          )}
          {/* Mưa / tuyết / lá rơi — chỉ ở ngoài cửa sổ */}
          {precip && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: precip.image,
                backgroundSize: precip.size,
                opacity: precip.opacity,
                animation: `rain-fall ${precip.duration} linear infinite`,
              }}
            />
          )}
          {/* Kính: phản chiếu + tối viền để cảnh nằm sau khung cửa */}
          <div
            className="absolute inset-0"
            style={{
              background: `${scene.glow}, linear-gradient(115deg, oklch(0.98 0.01 250 / 9%) 0%, transparent 32%, oklch(0.98 0.01 250 / 5%) 60%, transparent 78%), radial-gradient(125% 125% at 50% 45%, transparent 42%, oklch(0.1 0.02 280 / 62%) 100%)`,
            }}
          />
        </div>
      ))}
    </>
  );
}
