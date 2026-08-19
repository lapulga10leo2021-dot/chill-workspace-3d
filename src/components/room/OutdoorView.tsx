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

/** Khung cảnh ngoài trời hiện trong ô cửa sổ, đổi theo thời tiết đã chọn. */
export function OutdoorView({
  weather,
  area,
}: {
  weather: Weather;
  area: { left: number; top: number; width: number; height: number };
}) {
  return (
    <div
      aria-hidden={false}
      className="pointer-events-none absolute overflow-hidden rounded-[6%]"
      style={{
        left: `${area.left}%`,
        top: `${area.top}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
      }}
    >
      {(Object.keys(SCENES) as Weather[]).map((w) => (
        <img
          key={w}
          src={SCENES[w]}
          alt={w === weather ? ALT[w] : ""}
          loading="lazy"
          width={1024}
          height={720}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            w === weather ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0">
        <WeatherLayer weather={weather} />
      </div>
      {/* kính cửa sổ: phản chiếu nhẹ */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, oklch(1 0 0 / 12%) 0 18%, transparent 30% 70%, oklch(1 0 0 / 8%) 82% 100%)",
        }}
      />
    </div>
  );
}
