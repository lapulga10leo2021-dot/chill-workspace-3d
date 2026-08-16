import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signedUrl, useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomShell } from "@/components/room/RoomShell";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Thư viện tài liệu — Lofi Deskspace" },
      {
        name: "description",
        content: "Lưu và mở tài liệu PDF, Word, Excel riêng tư ngay trong phòng làm việc của bạn.",
      },
      { property: "og:title", content: "Thư viện tài liệu — Lofi Deskspace" },
      { property: "og:description", content: "Giá sách số: tài liệu riêng tư, mở nhanh khi cần." },
    ],
  }),
  component: LibraryPage,
});

type Doc = {
  id: string;
  name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  folder: string;
};

function prettySize(bytes: number | null) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function LibraryPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [folder, setFolder] = useState("General");
  const [uploading, setUploading] = useState(false);

  const docs = useQuery({
    queryKey: ["documents", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, name, file_path, mime_type, size_bytes, folder")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Doc[];
    },
  });

  async function upload(files: FileList | null) {
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
        if (upErr) throw upErr;
        const { error } = await supabase.from("documents").insert({
          user_id: user.id,
          name: file.name,
          file_path: path,
          mime_type: file.type || null,
          size_bytes: file.size,
          folder: folder.trim() || "General",
        });
        if (error) throw error;
      }
      toast.success("Đã lưu vào giá sách");
      void qc.invalidateQueries({ queryKey: ["documents", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải tài liệu thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function open(doc: Doc) {
    try {
      window.open(await signedUrl("documents", doc.file_path), "_blank", "noopener");
    } catch {
      toast.error("Không mở được tài liệu");
    }
  }

  async function remove(doc: Doc) {
    await supabase.storage.from("documents").remove([doc.file_path]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) toast.error(error.message);
    else void qc.invalidateQueries({ queryKey: ["documents", user?.id] });
  }

  const folders = Array.from(new Set((docs.data ?? []).map((d) => d.folder)));

  return (
    <RoomShell title="Thư viện tài liệu" subtitle="Giá sách riêng tư, chỉ bạn xem được">
      <div className="glass-panel flex flex-wrap items-end gap-3 rounded-xl p-5">
        <div className="min-w-48 flex-1">
          <label htmlFor="folder" className="text-xs text-muted-foreground">
            Thư mục
          </label>
          <Input id="folder" value={folder} onChange={(e) => setFolder(e.target.value)} />
        </div>
        <label className="inline-flex">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void upload(e.target.files)}
          />
          <Button asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Tải tài liệu lên
            </span>
          </Button>
        </label>
      </div>

      {!folders.length && (
        <p className="mt-8 text-sm text-muted-foreground">
          Giá sách còn trống — tải lên PDF, Word, Excel hoặc bất kỳ tệp bạn cần.
        </p>
      )}

      {folders.map((f) => (
        <section key={f} className="mt-8">
          <h2 className="text-base">{f}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(docs.data ?? [])
              .filter((d) => d.folder === f)
              .map((d) => (
                <article key={d.id} className="glass-panel rounded-xl p-4">
                  <FileText className="size-5 text-primary" />
                  <p className="mt-2 truncate text-sm" title={d.name}>
                    {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{prettySize(d.size_bytes)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => void open(d)}>
                      <Download className="size-4" /> Mở
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void remove(d)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ))}
    </RoomShell>
  );
}
