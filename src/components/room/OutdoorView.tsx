import type React from "react";
import type { Weather } from "./WeatherLayer";
import viewAutumn from "@/assets/view-autumn.jpg";
import viewClear from "@/assets/view-clear.jpg";
import viewNight from "@/assets/view-night.jpg";
import viewRain from "@/assets/view-rain.jpg";
import viewSnow from "@/assets/view-snow.jpg";

/** Ô kính được mô tả bằng đa giác (theo % khung 16/9) để khớp phối cảnh cửa sổ. */
export type GlassPane = { points: [number, number][] };

type Scene = {
  image: string;
  filter: string;
  position: string;
};

const SCENES: Record<Weather, Scene> = {
  clear: {
    image: viewClear,
    filter: "brightness(0.72) contrast(0.96) saturate(0.72)",
    position: "58% 52%",
  },
  rain: {
    image: viewRain,
    filter: "brightness(0.5) contrast(1.05) saturate(0.7)",
    position: "54% 48%",
  },
  snow: {
    image: viewSnow,
    filter: "brightness(0.68) contrast(0.92) saturate(0.65)",
    position: "56% 48%",
  },
  autumn: {
    image: viewAutumn,
    filter: "brightness(0.6) contrast(0.98) saturate(0.78)",
    position: "56% 50%",
  },
  night: {
    image: viewNight,
    filter: "brightness(0.52) contrast(1.08) saturate(0.68)",
    position: "55% 52%",
  },
};

const PRECIP: Partial<
  Record<Weather, { image: string; size: string; duration: string; opacity: number }>
> = {
  rain: {
    image:
      "repeating-linear-gradient(101deg, transparent 0 17px, oklch(0.9 0.025 245 / 30%) 18px 19px), repeating-linear-gradient(98deg, transparent 0 31px, oklch(0.9 0.025 245 / 18%) 32px 33px)",
    size: "100% 100%",
    duration: "1.15s",
    opacity: 0.38,
  },
  snow: {
    image:
      "radial-gradient(circle at 20% 20%, oklch(0.99 0.01 260 / 92%) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, oklch(0.99 0.01 260 / 70%) 0 2.5px, transparent 3px)",
    size: "110px 150px, 180px 210px",
    duration: "7s",
    opacity: 0.55,
  },
  autumn: {
    image:
      "radial-gradient(circle at 25% 25%, oklch(0.72 0.14 60 / 92%) 0 3px, transparent 4px), radial-gradient(circle at 68% 60%, oklch(0.62 0.16 40 / 82%) 0 3.5px, transparent 4px)",
    size: "140px 190px, 230px 250px",
    duration: "9s",
    opacity: 0.58,
  },
};

function clip(pane: GlassPane) {
  return `polygon(${pane.points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}

/**
 * Khung cảnh nằm sau đúng hai ô kính theo phối cảnh. Khung cửa nguyên bản của
 * căn phòng luôn nằm trên, còn thời tiết chỉ xuất hiện trong vùng ngoài trời.
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
            {/* Cùng một ảnh phủ toàn sân khấu để đường chân trời nối liền qua hai ô kính. */}
            <div
              key={`s-${weather}`}
              className="pointer-events-none absolute inset-0 animate-[fade-in_700ms_ease-out]"
              style={{
                clipPath,
                backgroundImage: `linear-gradient(oklch(0.12 0.025 280 / 12%), oklch(0.12 0.025 280 / 24%)), url(${scene.image})`,
                backgroundPosition: `center, ${scene.position}`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover, cover",
                filter: scene.filter,
                transform: "scale(1.015)",
              } as React.CSSProperties}
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
                   "linear-gradient(115deg, oklch(0.98 0.01 250 / 7%) 0%, transparent 27%, oklch(0.98 0.01 250 / 3%) 55%, transparent 74%), linear-gradient(180deg, oklch(0.08 0.018 280 / 8%), oklch(0.08 0.018 280 / 22%))",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
