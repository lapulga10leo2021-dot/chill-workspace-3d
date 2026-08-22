import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Lamp, Loader2, LogOut, Music2, Settings2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signedUrl, useSession } from "@/lib/session";
import { asWeather, useProfile, useUpdateProfile } from "@/lib/profile";
import { getAmbient, type AmbientKind } from "@/lib/ambient";
import { WEATHER_LABELS, type Weather } from "@/components/room/WeatherLayer";
import { OutdoorView, type GlassPane } from "@/components/room/OutdoorView";
import { RealtimeClock } from "@/components/room/RealtimeClock";
import { Stopwatch } from "@/components/room/Stopwatch";
import { Hotspot, RoomStage } from "@/components/room/RoomStage";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import roomNight from "@/assets/room-night.jpg";

export const Route = createFileRoute("/_authenticated/desk")({
  head: () => ({
    meta: [
      { title: "Phòng làm việc — Lofi Deskspace" },
      {
        name: "description",
        content:
          "Phòng làm việc lofi của bạn: nền động, thời tiết ngoài cửa sổ, đồng hồ thời gian thực và nhạc chill.",
      },
      { property: "og:title", content: "Phòng làm việc — Lofi Deskspace" },
      {
        property: "og:description",
        content: "Nền động, mưa rơi, piano nhẹ và đồng hồ tập trung trong một căn phòng ấm áp.",
      },
    ],
  }),
  component: DeskPage,
});

const WEATHERS: Weather[] = ["rain", "clear", "snow", "autumn", "night"];
/** Ô kính lớn bên phải (vùng bấm để đổi thời tiết) */
const WINDOW_AREA = { left: 76.6, top: 0, width: 19.5, height: 40 };
/** Vùng kính thật theo phối cảnh khung cửa sổ trong ảnh phòng */
const WINDOW_PANES: GlassPane[] = [
  // ô kính lớn bên phải
  {
    points: [
      [76.7, 0],
      [96.3, 0],
      [96.3, 53],
      [76.7, 42],
    ],
  },
  // ô kính nhỏ phía trên màn hình
  {
    points: [
      [57.5, 0],
      [72.6, 0],
      [72.6, 25],
      [57.5, 29],
    ],
  },
];
/** Kệ gỗ nhỏ phía trên thùng PC + đồng hồ điện tử đặt trên kệ */
const SHELF_AREA = { left: 38.2, top: 24.2, width: 12.6, height: 1.6 };
const CLOCK_AREA = { left: 40.4, top: 16.4, width: 8.4, height: 8 };

function DeskPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profileQuery = useProfile(user?.id);
  const updateProfile = useUpdateProfile(user?.id);
  const profile = profileQuery.data;

  const [ambient, setAmbient] = useState<AmbientKind>("off");
  const [volume, setVolume] = useState(0.6);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  const weather = asWeather(profile?.outdoor_weather);
  const showClock = profile?.show_clock ?? true;
  const showStopwatch = profile?.show_stopwatch ?? false;
  const lightsOn = profile?.lights_on ?? true;

  useEffect(() => {
    if (profile) setVolume(Number(profile.master_volume));
  }, [profile]);

  useEffect(() => {
    getAmbient().setVolume(volume);
  }, [volume]);

  useEffect(() => () => getAmbient().stop(), []);

  const backgrounds = useQuery({
    queryKey: ["backgrounds", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backgrounds")
        .select("id, title, file_path, media_type, is_shared, user_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeBg = useMemo(
    () => (backgrounds.data ?? []).find((b) => b.id === profile?.active_background_id) ?? null,
    [backgrounds.data, profile?.active_background_id],
  );

  useEffect(() => {
    let cancelled = false;
    if (!activeBg) {
      setBgUrl(null);
      return;
    }
    signedUrl("backgrounds", activeBg.file_path)
      .then((url) => {
        if (!cancelled) setBgUrl(url);
      })
      .catch(() => setBgUrl(null));
    return () => {
      cancelled = true;
    };
  }, [activeBg]);

  async function uploadBackground(files: FileList | null) {
    if (!files?.length || !user) return;
    const file = files[0]!;
    setUploadingBg(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("backgrounds").upload(path, file);
      if (upErr) throw upErr;
      const { data, error } = await supabase
        .from("backgrounds")
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^.]+$/, ""),
          file_path: path,
          media_type: file.type.startsWith("video") ? "video" : "image",
        })
        .select("id")
        .single();
      if (error) throw error;
      await updateProfile.mutateAsync({ active_background_id: data.id });
      void qc.invalidateQueries({ queryKey: ["backgrounds", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải nền thất bại");
    } finally {
      setUploadingBg(false);
    }
  }

  async function saveSession(minutes: number) {
    if (!user) return;
    const started = new Date(Date.now() - minutes * 60_000).toISOString();
    const { error } = await supabase.from("focus_sessions").insert({
      user_id: user.id,
      started_at: started,
      ended_at: new Date().toISOString(),
      duration_minutes: Number(minutes.toFixed(2)),
      mode: "focus",
    });
    if (error) toast.error(error.message);
  }

  function toggleAmbient(kind: AmbientKind) {
    const engine = getAmbient();
    const next = engine.current() === kind ? "off" : kind;
    engine.play(next);
    engine.setVolume(volume);
    setAmbient(next);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    getAmbient().stop();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Thanh trên */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-5 py-4">
        <p className="font-display text-sm tracking-[0.25em] text-primary">LOFI DESKSPACE</p>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="secondary">
                <Settings2 className="size-4" /> Tuỳ chỉnh phòng
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Tuỳ chỉnh phòng</SheetTitle>
                <SheetDescription>
                  Nền động, thời tiết ngoài trời, đồng hồ và âm thanh.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-7 px-4 pb-10">
                <section>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Ngoài cửa sổ
                  </Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {WEATHERS.map((w) => (
                      <Button
                        key={w}
                        size="sm"
                        variant={weather === w ? "default" : "secondary"}
                        onClick={() => updateProfile.mutate({ outdoor_weather: w })}
                      >
                        {WEATHER_LABELS[w]}
                      </Button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Hiển thị
                  </Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đồng hồ thời gian thực</span>
                    <Switch
                      checked={showClock}
                      onCheckedChange={(v) => updateProfile.mutate({ show_clock: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đồng hồ bấm giờ</span>
                    <Switch
                      checked={showStopwatch}
                      onCheckedChange={(v) => updateProfile.mutate({ show_stopwatch: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đèn bàn</span>
                    <Switch
                      checked={lightsOn}
                      onCheckedChange={(v) => updateProfile.mutate({ lights_on: v })}
                    />
                  </div>
                </section>

                <section>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Âm lượng
                  </Label>
                  <Slider
                    className="mt-4"
                    value={[Math.round(volume * 100)]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => setVolume((v ?? 60) / 100)}
                    onValueCommit={([v]) =>
                      updateProfile.mutate({ master_volume: (v ?? 60) / 100 })
                    }
                  />
                </section>

                <section>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Nền phòng
                  </Label>
                  <label className="mt-3 inline-flex">
                    <input
                      type="file"
                      accept="video/*,image/*"
                      className="hidden"
                      onChange={(e) => void uploadBackground(e.target.files)}
                    />
                    <Button asChild variant="secondary" disabled={uploadingBg}>
                      <span>
                        {uploadingBg ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Upload className="size-4" />
                        )}
                        Tải nền lên (video/ảnh)
                      </span>
                    </Button>
                  </label>
                  <div className="mt-3 space-y-2">
                    <Button
                      size="sm"
                      variant={!profile?.active_background_id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => updateProfile.mutate({ active_background_id: null })}
                    >
                      Nền mặc định (phòng lofi ban đêm)
                    </Button>
                    {(backgrounds.data ?? []).map((b) => (
                      <Button
                        key={b.id}
                        size="sm"
                        variant={profile?.active_background_id === b.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => updateProfile.mutate({ active_background_id: b.id })}
                      >
                        {b.title}
                      </Button>
                    ))}
                  </div>
                </section>
              </div>
            </SheetContent>
          </Sheet>
          <Button size="sm" variant="ghost" onClick={signOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Nền phòng + vật dụng bấm được, cùng một khung toạ độ */}
      <RoomStage
        background={
          <>
            {bgUrl && activeBg?.media_type === "video" ? (
              <video
                key={bgUrl}
                src={bgUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <img
                src={bgUrl ?? roomNight}
                alt="Phòng làm việc với bàn, màn hình, giá sách, đèn và cửa sổ"
                className="absolute inset-0 size-full object-cover"
              />
            )}
            {/* Khung cảnh ngoài trời trong ô cửa sổ */}
            {!bgUrl && (
              <OutdoorView weather={weather} panes={WINDOW_PANES} />
            )}
            {/* Kệ gỗ nhỏ treo trên thùng PC (chỗ đặt đồng hồ) */}
            {showClock && (
              <div
                aria-hidden
                className="pointer-events-none absolute rounded-[2px]"
                style={{
                  left: `${SHELF_AREA.left}%`,
                  top: `${SHELF_AREA.top}%`,
                  width: `${SHELF_AREA.width}%`,
                  height: `${SHELF_AREA.height}%`,
                  background:
                    "linear-gradient(180deg, oklch(0.42 0.06 55) 0%, oklch(0.3 0.05 45) 55%, oklch(0.18 0.03 40) 100%)",
                  boxShadow:
                    "0 10px 18px -8px oklch(0 0 0 / 80%), inset 0 1px 0 oklch(0.62 0.08 70 / 45%)",
                }}
              />
            )}
            {/* Đèn bàn */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-700"
              style={{
                background: lightsOn
                  ? "radial-gradient(34% 34% at 76% 46%, oklch(0.85 0.12 70 / 30%), transparent 72%)"
                  : "oklch(0.1 0.02 292 / 58%)",
                animation: lightsOn ? "flicker 6s ease-in-out infinite" : undefined,
              }}
            />
          </>
        }
      >
        {showClock && (
          <Hotspot
            label={showStopwatch ? "Đồng hồ — Ẩn bấm giờ" : "Đồng hồ — Bấm giờ"}
            area={CLOCK_AREA}
            onClick={() => updateProfile.mutate({ show_stopwatch: !showStopwatch })}
          >
            <span className="pointer-events-none absolute inset-x-[6%] bottom-[6%] flex items-end justify-center">
              <RealtimeClock compact />
            </span>
          </Hotspot>
        )}


        <Hotspot
          label="Giá sách — Thư viện tài liệu"
          area={{ left: 6, top: 14, width: 22, height: 58 }}
          onClick={() => void navigate({ to: "/library" })}
        />
        <Hotspot
          label="Màn hình — Thống kê"
          area={{ left: 51, top: 22, width: 19, height: 30 }}
          onClick={() => void navigate({ to: "/stats" })}
        />
        <Hotspot
          label="Tai nghe — Playlist nhạc"
          area={{ left: 67.5, top: 45, width: 6.5, height: 13 }}
          onClick={() => void navigate({ to: "/music" })}
        />
        <Hotspot
          label={`Cửa sổ — ${WEATHER_LABELS[weather]}`}
          area={WINDOW_AREA}
          onClick={() => {
            const next = WEATHERS[(WEATHERS.indexOf(weather) + 1) % WEATHERS.length]!;
            updateProfile.mutate({ outdoor_weather: next });
          }}
        />
        <Hotspot
          label={lightsOn ? "Đèn bàn — Tắt đèn" : "Đèn bàn — Bật đèn"}
          area={{ left: 73.5, top: 33, width: 9, height: 14 }}
          onClick={() => updateProfile.mutate({ lights_on: !lightsOn })}
        />
        <Hotspot
          label="Bàn phím — Test bàn phím"
          area={{ left: 48.5, top: 47, width: 13, height: 9 }}
          onClick={() => void navigate({ to: "/keyboard" })}
        />
        <Hotspot
          label="Loa — Nhạc gốc (mưa / piano)"
          area={{ left: 41.5, top: 27, width: 6, height: 14 }}
          onClick={() => toggleAmbient(ambient === "rain" ? "piano" : "rain")}
        />
      </RoomStage>

      {/* Đồng hồ bấm giờ nổi lên khi bấm vào đồng hồ trên bàn */}
      {showStopwatch && (
        <section className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex justify-center px-5">
          <div className="glass-panel pointer-events-auto w-full max-w-sm rounded-2xl p-5">
            <Stopwatch onSave={(m) => void saveSession(m)} />
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => updateProfile.mutate({ show_stopwatch: false })}
            >
              Ẩn bấm giờ
            </Button>
          </div>
        </section>
      )}

      <p className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-[11px] text-muted-foreground">
        <Music2 className="mr-1 inline size-3" />
        Bấm vào vật dụng: giá sách, màn hình, tai nghe, đồng hồ, cửa sổ, đèn, bàn phím
        <Lamp className="ml-1 inline size-3" />
      </p>
    </main>
  );
}
