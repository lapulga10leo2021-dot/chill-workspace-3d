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

export type Pane = { left: number; top: number; width: number; height: number };

/**
 * Khung cảnh ngoài trời vẽ trực tiếp lên từng ô kính của cửa sổ.
 * Ảnh là chi tiết trang trí (alt rỗng) nên không bao giờ hiện chữ thay thế tràn ra phòng.
 */
export function OutdoorView({ weather, panes }: { weather: Weather; panes: Pane[] }) {
  return (
    <>
      {panes.map((p, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.width}%`,
            height: `${p.height}%`,
            WebkitMaskImage:
              "radial-gradient(125% 125% at 50% 45%, black 62%, transparent 100%)",
            maskImage: "radial-gradient(125% 125% at 50% 45%, black 62%, transparent 100%)",
          }}
        >
          <img
            key={weather}
            src={SCENES[weather]}
            alt=""
            decoding="async"
            className="absolute inset-0 size-full animate-[fade-in_700ms_ease-out] object-cover"
            style={{ filter: "brightness(0.8) saturate(0.95) contrast(0.95)" }}
          />
          <div className="absolute inset-0 opacity-80">
            <WeatherLayer weather={weather} />
          </div>
          {/* kính: phản chiếu nhẹ + tối dần về viền để hoà vào khung cửa */}
          <div
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
