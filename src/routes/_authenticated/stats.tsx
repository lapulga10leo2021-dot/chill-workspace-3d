import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatMinutes, useSession } from "@/lib/session";
import { RoomShell } from "@/components/room/RoomShell";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({
    meta: [
      { title: "Thống kê tập trung — Lofi Deskspace" },
      {
        name: "description",
        content: "Xem số phút học và làm việc mỗi ngày, chuỗi ngày tập trung và tổng thời gian.",
      },
      { property: "og:title", content: "Thống kê tập trung — Lofi Deskspace" },
      { property: "og:description", content: "Theo dõi thời gian học/làm việc theo ngày." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { user } = useSession();

  const sessions = useQuery({
    queryKey: ["focus_sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("started_at, duration_minutes, label, mode")
        .order("started_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const rows = sessions.data ?? [];
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const key = new Date(r.started_at).toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(r.duration_minutes));
  }

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      minutes: Math.round(byDay.get(key) ?? 0),
    };
  });

  const total = rows.reduce((sum, r) => sum + Number(r.duration_minutes), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = byDay.get(todayKey) ?? 0;
  const activeDays = byDay.size;

  return (
    <RoomShell title="Thống kê thời gian" subtitle="Dựa trên các phiên bạn lưu từ đồng hồ bấm giờ">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Hôm nay", value: formatMinutes(today) },
          { label: "Tổng cộng", value: formatMinutes(total) },
          { label: "Số ngày có mặt", value: `${activeDays} ngày` },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-warm-gradient">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-6 rounded-xl p-5">
        <h2 className="text-base">14 ngày gần nhất</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" fontSize={11} stroke="var(--color-muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--color-muted-foreground)" unit="p" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-popover-foreground)",
                }}
                formatter={(v) => [`${v} phút`, "Thời lượng"]}
              />
              <Bar dataKey="minutes" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base">Phiên gần đây</h2>
        {!rows.length ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Chưa có phiên nào — bật đồng hồ bấm giờ trong phòng và lưu lại khi xong.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {rows.slice(0, 20).map((r, i) => (
              <li key={i} className="flex items-center justify-between bg-card/60 px-4 py-3 text-sm">
                <span>{new Date(r.started_at).toLocaleString("vi-VN")}</span>
                <span className="text-primary">{formatMinutes(Number(r.duration_minutes))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RoomShell>
  );
}
