import { create } from "zustand";

export type Orientation = "upperSuited" | "upperOffsuit";
export type RangeMap = Record<string, number>;
export type Street = "preflop" | "flop" | "turn" | "river";
export type StackProfile = "Deep" | "Mid" | "Short" | "PushFold"

type RangeState = {
  // UI state
  street: Street;
  setStreet: (s: Street) => void;

  stack: StackProfile;
  setStack: (s: StackProfile) => void

  // range hiện tại (ứng với street đang chọn)
  range: RangeMap;
  name: string | null;
  orientation: Orientation;

  setWeight: (key: string, value: number) => void;
  bulkPaint: (keys: string[], value: number) => void;
  clear: () => void;
  setOrientation: (o: Orientation) => void;
  setName: (n: string | null) => void;
  load: (payload: { name?: string | null; range: RangeMap; orientation?: Orientation }) => void;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

export const useRangeStore = create<RangeState>((set) => ({
  street: "preflop",
  setStreet: (s) => set({ street: s }),
  stack: "Deep",
  setStack: (s) => set({ stack: s}),
  range: {},
  name: "__autosave__",
  orientation: "upperSuited",

  setWeight: (key, value) => set((s) => ({ range: { ...s.range, [key]: clamp01(value) } })),
  bulkPaint: (keys, value) =>
    set((s) => {
      const next = { ...s.range };
      keys.forEach((k) => (next[k] = clamp01(value)));
      return { range: next };
    }),
  clear: () => set({ range: {}, name: "__autosave__" }),
  setOrientation: (o) => set({ orientation: o }),
  setName: (n) => set({ name: n }),
  load: ({ name, range, orientation }) =>
    set({ name: name ?? "__autosave__", range: range ?? {}, orientation: orientation ?? "upperSuited" }),
}));
