import { WeatherLayer, type Weather } from "./WeatherLayer";

export type Pane = { left: number; top: number; width: number; height: number };

/**
 * Chỉ phủ hiệu ứng thời tiết lên từng ô kính của cửa sổ (không chèn ảnh nào),
 * giữ nguyên khung cửa sổ trong ảnh phòng.
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
          }}
        >
          <WeatherLayer weather={weather} />
        </div>
      ))}
    </>
  );
}
