import { WeatherLayer, type Weather } from "./WeatherLayer";
import viewClear from "@/assets/view-clear.jpg";
import viewRain from "@/assets/view-rain.jpg";
import viewSnow from "@/assets/view-snow.jpg";
import viewAutumn from "@/assets/view-autumn.jpg";
import viewNight from "@/assets/view-night.jpg";

const SCENES: Record<Weather, string> = {
  clear: viewClear,
  rain: viewRain,
  snow: viewSnow,
  autumn: viewAutumn,
  night: viewNight,
};

const ALT: Record<Weather, string> = {
  clear: "Khung cảnh ngoài trời: nắng vàng",
  rain: "Khung cảnh ngoài trời: phố mưa",
  snow: "Khung cảnh ngoài trời: tuyết rơi",
  autumn: "Khung cảnh ngoài trời: lá vàng mùa thu",
  night: "Khung cảnh ngoài trời: thành phố về đêm",
};

export type Pane = { left: number; top: number; width: number; height: number };

/**
 * Khung cảnh ngoài trời vẽ trực tiếp lên từng ô kính của cửa sổ.
 * Ảnh được hoà vào phòng (tối + mờ viền) nên không còn trông như một ô ảnh dán lên.
 */
export function OutdoorView({ weather, panes }: { weather: Weather; panes: Pane[] }) {
  return (
    <>
      {panes.map((p, i) => (
        <div
          key={i}
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.width}%`,
            height: `${p.height}%`,
            WebkitMaskImage:
              "radial-gradient(120% 120% at 50% 50%, black 60%, transparent 100%)",
            maskImage: "radial-gradient(120% 120% at 50% 50%, black 60%, transparent 100%)",
          }}
        >
          {(Object.keys(SCENES) as Weather[]).map((w) => (
            <img
              key={w}
              src={SCENES[w]}
              alt={w === weather && i === 0 ? ALT[w] : ""}
              loading="lazy"
              width={1024}
              height={720}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
                w === weather ? "opacity-100" : "opacity-0"
              }`}
              style={{ filter: "brightness(0.78) saturate(0.92) contrast(0.95)" }}
            />
          ))}
          <div className="absolute inset-0 opacity-80">
            <WeatherLayer weather={weather} />
          </div>
          {/* kính: phản chiếu nhẹ + tối dần về viền để hoà vào khung cửa */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, oklch(1 0 0 / 10%) 0 16%, transparent 28% 72%, oklch(1 0 0 / 7%) 84% 100%), radial-gradient(130% 130% at 50% 40%, transparent 55%, oklch(0.12 0.02 285 / 85%) 100%)",
            }}
          />
        </div>
      ))}
    </>
  );
}
