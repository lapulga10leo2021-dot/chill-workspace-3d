import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Play, Trash2, Upload, ListMusic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, signedUrl } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomShell } from "@/components/room/RoomShell";

export const Route = createFileRoute("/_authenticated/music")({
  head: () => ({
    meta: [
      { title: "Playlist nhạc — Lofi Deskspace" },
      {
        name: "description",
        content: "Quản lý playlist nhạc chill của bạn: tải nhạc lên, tạo danh sách và phát khi làm việc.",
      },
      { property: "og:title", content: "Playlist nhạc — Lofi Deskspace" },
      { property: "og:description", content: "Tải nhạc lên và sắp xếp playlist cho phòng làm việc." },
    ],
  }),
  component: MusicPage,
});

type Track = {
  id: string;
  title: string;
  artist: string | null;
  file_path: string;
  playlist_id: string | null;
  category: string;
};

function MusicPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [uploading, setUploading] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);

  const playlists = useQuery({
    queryKey: ["playlists", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("id, name")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const tracks = useQuery({
    queryKey: ["tracks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, title, artist, file_path, playlist_id, category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Track[];
    },
  });

  async function upload(files: FileList | null, playlistId: string | null) {
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("tracks").upload(path, file);
        if (upErr) throw upErr;
        const { error } = await supabase.from("tracks").insert({
          user_id: user.id,
          title: file.name.replace(/\.[^.]+$/, ""),
          file_path: path,
          playlist_id: playlistId,
          category: "user",
        });
        if (error) throw error;
      }
      toast.success("Đã tải nhạc lên");
      void qc.invalidateQueries({ queryKey: ["tracks", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải nhạc thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function play(track: Track) {
    try {
      const url = await signedUrl("tracks", track.file_path);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setNowPlaying(track.title);
      }
    } catch {
      toast.error("Không phát được bài này");
    }
  }

  async function remove(track: Track) {
    await supabase.storage.from("tracks").remove([track.file_path]);
    const { error } = await supabase.from("tracks").delete().eq("id", track.id);
    if (error) toast.error(error.message);
    else void qc.invalidateQueries({ queryKey: ["tracks", user?.id] });
  }

  async function createPlaylist() {
    if (!playlistName.trim() || !user) return;
    const { error } = await supabase
      .from("playlists")
      .insert({ user_id: user.id, name: playlistName.trim() });
    if (error) toast.error(error.message);
    else {
      setPlaylistName("");
      void qc.invalidateQueries({ queryKey: ["playlists", user.id] });
    }
  }

  const grouped = (playlists.data ?? []).map((pl) => ({
    ...pl,
    items: (tracks.data ?? []).filter((t) => t.playlist_id === pl.id),
  }));
  const loose = (tracks.data ?? []).filter((t) => !t.playlist_id);

  return (
    <RoomShell title="Playlist nhạc" subtitle="Nhạc gốc mưa/piano nằm trong phòng, đây là nhạc của bạn">
      <audio ref={audioRef} onEnded={() => setNowPlaying(null)} />

      <div className="glass-panel flex flex-wrap items-end gap-3 rounded-xl p-5">
        <div className="min-w-48 flex-1">
          <label className="text-xs text-muted-foreground" htmlFor="pl">
            Tạo playlist mới
          </label>
          <Input
            id="pl"
            value={playlistName}
            placeholder="Ví dụ: Deep focus"
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        </div>
        <Button onClick={createPlaylist}>
          <ListMusic className="size-4" /> Thêm playlist
        </Button>
        <label className="inline-flex">
          <input
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => void upload(e.target.files, null)}
          />
          <Button asChild variant="secondary" disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Tải nhạc lên
            </span>
          </Button>
        </label>
      </div>

      {nowPlaying && (
        <p className="mt-4 text-sm text-primary">Đang phát: {nowPlaying}</p>
      )}

      <div className="mt-8 space-y-8">
        {grouped.map((pl) => (
          <section key={pl.id}>
            <div className="flex items-center justify-between">
              <h2 className="text-base">{pl.name}</h2>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void upload(e.target.files, pl.id)}
                />
                <Button asChild size="sm" variant="ghost">
                  <span>+ Thêm bài</span>
                </Button>
              </label>
            </div>
            <TrackList items={pl.items} onPlay={play} onRemove={remove} />
          </section>
        ))}

        <section>
          <h2 className="text-base">Chưa phân loại</h2>
          <TrackList items={loose} onPlay={play} onRemove={remove} />
        </section>
      </div>
    </RoomShell>
  );
}

function TrackList({
  items,
  onPlay,
  onRemove,
}: {
  items: Track[];
  onPlay: (t: Track) => void;
  onRemove: (t: Track) => void;
}) {
  if (!items.length) {
    return <p className="mt-2 text-sm text-muted-foreground">Chưa có bài nào.</p>;
  }
  return (
    <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map((t) => (
        <li key={t.id} className="flex items-center gap-3 bg-card/60 px-4 py-3">
          <Button size="icon" variant="ghost" onClick={() => onPlay(t)} aria-label={`Phát ${t.title}`}>
            <Play className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{t.title}</p>
            {t.artist && <p className="truncate text-xs text-muted-foreground">{t.artist}</p>}
          </div>
          <Button size="icon" variant="ghost" onClick={() => onRemove(t)} aria-label="Xoá">
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
