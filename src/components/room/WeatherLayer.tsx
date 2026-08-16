export type Weather = "clear" | "rain" | "snow" | "autumn" | "night";

export const WEATHER_LABELS: Record<Weather, string> = {
  clear: "Nắng",
  rain: "Mưa rơi",
  snow: "Tuyết rơi",
  autumn: "Lá vàng rơi",
  night: "Đêm tĩnh lặng",
};

/** Hiệu ứng thời tiết động phủ lên khung cửa sổ / toàn phòng. */
export function WeatherLayer({ weather }: { weather: Weather }) {
  if (weather === "clear") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 420px at 78% 12%, oklch(0.86 0.12 82 / 28%), transparent 70%)",
        }}
      />
    );
  }

  if (weather === "night") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 80% 10%, oklch(0.7 0.09 260 / 22%), transparent 70%)",
        }}
      />
    );
  }

  if (weather === "rain") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "repeating-linear-gradient(102deg, transparent 0 7px, oklch(0.9 0.03 250 / 55%) 7px 8px), repeating-linear-gradient(98deg, transparent 0 13px, oklch(0.9 0.03 250 / 30%) 13px 14px)",
          animation: "rain-fall 0.85s linear infinite",
        }}
      />
    );
  }

  const dots =
    weather === "snow"
      ? "radial-gradient(circle at 20% 20%, oklch(0.98 0.01 260 / 85%) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, oklch(0.98 0.01 260 / 65%) 0 2.5px, transparent 3px)"
      : "radial-gradient(circle at 25% 25%, oklch(0.78 0.13 60 / 85%) 0 3px, transparent 4px), radial-gradient(circle at 68% 60%, oklch(0.7 0.15 40 / 75%) 0 3.5px, transparent 4px)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-70"
      style={{
        backgroundImage: dots,
        backgroundSize: "180px 180px, 260px 260px",
        animation: "rain-fall 9s linear infinite",
      }}
    />
  );
}
