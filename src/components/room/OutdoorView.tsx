import type React from "react";
import type { Weather } from "./WeatherLayer";
import viewAutumn from "@/assets/view-autumn.jpg";
import viewClear from "@/assets/view-clear.jpg";
import viewNight from "@/assets/view-night.jpg";
import viewRainAsset from "@/assets/view-rain-integrated.jpg.asset.json";
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
    filter: "brightness(0.58) contrast(0.94) saturate(0.62)",
    position: "58% 52%",
  },
  rain: {
    image: viewRainAsset.url,
    filter: "brightness(0.72) contrast(0.92) saturate(0.72)",
    position: "53% 47%",
  },
  snow: {
    image: viewSnow,
    filter: "brightness(0.56) contrast(0.9) saturate(0.52)",
    position: "56% 48%",
  },
  autumn: {
    image: viewAutumn,
    filter: "brightness(0.48) contrast(0.96) saturate(0.68)",
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
      "repeating-linear-gradient(99deg, transparent 0 71px, oklch(0.9 0.018 225 / 13%) 72px 73px), repeating-linear-gradient(97deg, transparent 0 119px, oklch(0.92 0.015 220 / 8%) 120px 121px)",
    size: "100% 100%",
    duration: "1.15s",
    opacity: 0.1,
  },
  snow: {
    image:
      "radial-gradient(circle at 20% 20%, oklch(0.99 0.01 260 / 92%) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, oklch(0.99 0.01 260 / 70%) 0 2.5px, transparent 3px)",
    size: "110px 150px, 180px 210px",
    duration: "7s",
    opacity: 0.42,
  },
  autumn: {
    image:
      "radial-gradient(circle at 25% 25%, oklch(0.72 0.14 60 / 92%) 0 3px, transparent 4px), radial-gradient(circle at 68% 60%, oklch(0.62 0.16 40 / 82%) 0 3.5px, transparent 4px)",
    size: "140px 190px, 230px 250px",
    duration: "9s",
    opacity: 0.46,
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
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {panes.map((pane, index) => {
        const clipPath = clip(pane);
        return (
          <div key={index} className="contents">
            {/* Mỗi ô chỉ cắt một phần của cùng tấm cảnh toàn sân khấu nên đường nét vẫn liền nhau. */}
            <div
              key={`scene-${weather}-${index}`}
              className="absolute inset-0 animate-[fade-in_700ms_ease-out]"
              style={{
                clipPath,
                backgroundImage: `url(${scene.image})`,
                backgroundPosition: scene.position,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                filter: scene.filter,
              } as React.CSSProperties}
            />
            <div
              className="absolute inset-0"
              style={{
                clipPath,
                background:
                  "radial-gradient(36% 48% at 86% 44%, oklch(0.72 0.105 67 / 17%), transparent 72%), linear-gradient(180deg, oklch(0.11 0.028 225 / 9%), oklch(0.08 0.018 260 / 28%))",
                boxShadow: "inset 0 0 54px oklch(0.055 0.012 250 / 62%)",
              }}
            />
            {precip && (
              <div
                className="absolute inset-0"
                style={{
                  clipPath,
                  backgroundImage: precip.image,
                  backgroundSize: precip.size,
                  opacity: precip.opacity,
                  animation: `rain-fall ${precip.duration} linear infinite`,
                }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                clipPath,
                background:
                  "linear-gradient(116deg, oklch(0.94 0.018 215 / 7%) 0%, transparent 19%, transparent 57%, oklch(0.93 0.02 65 / 4%) 68%, transparent 78%)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
