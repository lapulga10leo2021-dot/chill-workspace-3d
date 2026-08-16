/**
 * Nhạc gốc tổng hợp bằng Web Audio: tiếng mưa rơi và piano nhẹ nhàng.
 * Không cần file nhạc nên luôn có sẵn ngay cả khi chưa ai tải nhạc lên.
 */
export type AmbientKind = "rain" | "piano" | "off";

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private timer: number | null = null;
  private kind: AmbientKind = "off";

  private ensure() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    return this.ctx;
  }

  setVolume(v: number) {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.ctx.currentTime, 0.15);
    }
  }

  current() {
    return this.kind;
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    for (const node of this.nodes) {
      try {
        (node as AudioScheduledSourceNode).stop?.();
      } catch {
        /* noop */
      }
      node.disconnect();
    }
    this.nodes = [];
    this.kind = "off";
  }

  play(kind: AmbientKind) {
    this.stop();
    if (kind === "off") return;
    const ctx = this.ensure();
    this.kind = kind;
    if (kind === "rain") this.startRain(ctx);
    else this.startPiano(ctx);
  }

  private startRain(ctx: AudioContext) {
    const seconds = 3;
    const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const highs = ctx.createBiquadFilter();
    highs.type = "highpass";
    highs.frequency.value = 420;
    const lows = ctx.createBiquadFilter();
    lows.type = "lowpass";
    lows.frequency.value = 5200;
    const gain = ctx.createGain();
    gain.gain.value = 0.55;

    source.connect(highs).connect(lows).connect(gain).connect(this.master!);
    source.start();
    this.nodes.push(source, highs, lows, gain);
  }

  private startPiano(ctx: AudioContext) {
    const bed = ctx.createGain();
    bed.gain.value = 0.9;
    bed.connect(this.master!);
    this.nodes.push(bed);

    const note = () => {
      const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]!;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc2.type = "sine";
      osc.frequency.value = freq;
      osc2.frequency.value = freq * 2.001;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 3.6);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(bed);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 3.8);
      osc2.stop(now + 3.8);
    };

    note();
    this.timer = window.setInterval(note, 1600);
  }
}

let engine: AmbientEngine | null = null;
export function getAmbient() {
  if (!engine) engine = new AmbientEngine();
  return engine;
}
