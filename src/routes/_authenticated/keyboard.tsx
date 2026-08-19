import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/keyboard")({
  head: () => ({
    meta: [
      { title: "Test bàn phím — Lofi Deskspace" },
      {
        name: "description",
        content:
          "Kiểm tra bàn phím ngay trong phòng làm việc: bấm phím để xem phím nào còn nhận, phím nào bị kẹt.",
      },
      { property: "og:title", content: "Test bàn phím — Lofi Deskspace" },
      {
        property: "og:description",
        content: "Bấm từng phím để kiểm tra bàn phím của bạn, phím đã nhận sẽ sáng lên.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KeyboardTestPage,
});

const ROWS: { code: string; label: string; w?: number }[][] = [
  [
    { code: "Escape", label: "Esc" },
    { code: "F1", label: "F1" },
    { code: "F2", label: "F2" },
    { code: "F3", label: "F3" },
    { code: "F4", label: "F4" },
    { code: "F5", label: "F5" },
    { code: "F6", label: "F6" },
    { code: "F7", label: "F7" },
    { code: "F8", label: "F8" },
    { code: "F9", label: "F9" },
    { code: "F10", label: "F10" },
    { code: "F11", label: "F11" },
    { code: "F12", label: "F12" },
  ],
  [
    { code: "Backquote", label: "`" },
    { code: "Digit1", label: "1" },
    { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" },
    { code: "Digit4", label: "4" },
    { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" },
    { code: "Digit7", label: "7" },
    { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-" },
    { code: "Equal", label: "=" },
    { code: "Backspace", label: "Backspace", w: 2 },
  ],
  [
    { code: "Tab", label: "Tab", w: 1.5 },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[" },
    { code: "BracketRight", label: "]" },
    { code: "Backslash", label: "\\", w: 1.5 },
  ],
  [
    { code: "CapsLock", label: "Caps", w: 1.8 },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";" },
    { code: "Quote", label: "'" },
    { code: "Enter", label: "Enter", w: 2.2 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", w: 2.4 },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: "," },
    { code: "Period", label: "." },
    { code: "Slash", label: "/" },
    { code: "ShiftRight", label: "Shift", w: 2.6 },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", w: 1.4 },
    { code: "MetaLeft", label: "Win", w: 1.2 },
    { code: "AltLeft", label: "Alt", w: 1.2 },
    { code: "Space", label: "Space", w: 6 },
    { code: "AltRight", label: "Alt", w: 1.2 },
    { code: "ArrowLeft", label: "←" },
    { code: "ArrowUp", label: "↑" },
    { code: "ArrowDown", label: "↓" },
    { code: "ArrowRight", label: "→" },
    { code: "ControlRight", label: "Ctrl", w: 1.4 },
  ],
];

function KeyboardTestPage() {
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [held, setHeld] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<{ key: string; code: string } | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      e.preventDefault();
      setLast({ key: e.key === " " ? "Space" : e.key, code: e.code });
      setPressed((s) => new Set(s).add(e.code));
      setHeld((s) => new Set(s).add(e.code));
    };
    const up = (e: KeyboardEvent) => {
      setHeld((s) => {
        const next = new Set(s);
        next.delete(e.code);
        return next;
      });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const total = useMemo(() => ROWS.flat().length, []);
  const done = ROWS.flat().filter((k) => pressed.has(k.code)).length;

  return (
    <main className="min-h-screen px-5 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Button asChild size="sm" variant="secondary">
          <Link to="/desk">
            <ArrowLeft className="size-4" /> Về phòng làm việc
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setPressed(new Set());
            setLast(null);
          }}
        >
          <RotateCcw className="size-4" /> Làm lại
        </Button>
      </header>

      <h1 className="font-display text-2xl">Test bàn phím</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bấm từng phím trên bàn phím thật — phím nhận được sẽ sáng lên. Đã kiểm tra {done}/{total}{" "}
        phím.
      </p>
      <p className="mt-2 font-mono text-sm text-primary">
        {last ? `${last.key}  ·  ${last.code}` : "Chưa bấm phím nào"}
      </p>

      <div className="glass-panel mt-6 space-y-1.5 overflow-x-auto rounded-2xl p-3">
        {ROWS.map((row, i) => (
          <div key={i} className="flex min-w-max gap-1.5">
            {row.map((k) => {
              const isHeld = held.has(k.code);
              const isDone = pressed.has(k.code);
              return (
                <div
                  key={k.code}
                  className={`flex h-10 items-center justify-center rounded-md border text-[11px] transition-colors ${
                    isHeld
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary/50 bg-primary/20 text-foreground"
                        : "border-border bg-card/60 text-muted-foreground"
                  }`}
                  style={{ width: `${(k.w ?? 1) * 2.35}rem` }}
                >
                  {k.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
