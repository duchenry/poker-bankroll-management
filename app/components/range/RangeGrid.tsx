"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRangeStore } from "@/lib/store/rangeStore";
import { loadAutosave, saveAutosave } from "@/lib/utils/rangeRepo";
import RangeToolbar from "./RangeToolbar";

const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const CYCLE = [0, 0.25, 0.5, 0.75, 1];

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
const rankIndex = (r: string) => RANKS.indexOf(r);

function keyFor(i: number, j: number, orientation: "upperSuited" | "upperOffsuit") {
  const a = RANKS[i], b = RANKS[j];
  if (i === j) return `${a}${b}`;
  const suitedIsUpper = orientation === "upperSuited";
  const isUpper = i < j;
  const tag = isUpper === suitedIsUpper ? "s" : "o";
  const first = rankIndex(a) <= rankIndex(b) ? a : b;
  const second = first === a ? b : a;
  return `${first}${second}${tag}`;
}
const labelForKey = (k: string) => k;

function weightToClass(w: number) {
  if (w <= 0) return "bg-slate-800/40 border-slate-700";
  const step = Math.round(w * 4);
  const shades = [
    "bg-blue-600 border-blue-500",
    "bg-blue-600 border-blue-500",
    "bg-green-700 border-green-600",
    "bg-yellow-500 border-yellow-700",
    "bg-red-600 border-red-500",
  ];
  return shades[step];
}
const nextCycle = (v: number) => CYCLE[(CYCLE.findIndex((x) => Math.abs(x - v) < 1e-6) + 1) % CYCLE.length];

export default function RangeGrid() {
  const orientation = useRangeStore((s) => s.orientation);
  const range = useRangeStore((s) => s.range);
  const street = useRangeStore((s) => s.street)
  const stack = useRangeStore((s) => s.stack)
  const setWeight = useRangeStore((s) => s.setWeight);
  const bulkPaint = useRangeStore((s) => s.bulkPaint);
  const loadStore = useRangeStore((s) => s.load);

  const [saveStatus, setSaveStatus] = useState<string>("");

   // Load autosave cho street/stack khi mount + khi đổi street/stack
  useEffect(() => {
    (async () => {
      const doc = await loadAutosave(street, stack);
      if (doc) {
        loadStore({ name: doc.name, range: doc.range, orientation: doc.orientation });
      } else {
        loadStore({ name: "__autosave__", range: {}, orientation });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street, stack]);

  // --- Autosave (debounce 400ms)
  const debounceRef = useRef<any>(null);
  const pendingRef = useRef<boolean>(false); // biết đang có thay đổi chưa flush
  useEffect(() => {
    setSaveStatus("Saving…");
    pendingRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await saveAutosave(street,stack, range, orientation);
        setSaveStatus("Saved");
        pendingRef.current = false;
      } catch (e: any) {
        setSaveStatus(e?.message === "NOT_SIGNED_IN" ? "Not signed in" : `Error: ${e?.message ?? "save failed"}`);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [range, orientation, street, stack]);

    useEffect(() => {
    (async () => {
      const doc = await loadAutosave(street, stack);
      if (doc) {
        loadStore({ name: doc.name, range: doc.range, orientation: doc.orientation });
      } else {
        // street mới chưa có autosave -> reset nhạt
        loadStore({ name: "__autosave__", range: {}, orientation });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street, stack]);

  // --- Flush ngay khi nhả chuột (đảm bảo nét tô cuối được lưu)
  const flushNow = useCallback(async () => {
    if (!pendingRef.current) return;
    try {
      await saveAutosave(street,stack, range, orientation);
      setSaveStatus("Saved");
      pendingRef.current = false;
    } catch (e: any) {
      setSaveStatus(e?.message === "NOT_SIGNED_IN" ? "Not signed in" : `Error: ${e?.message ?? "save failed"}`);
    }
  }, [range, orientation, street, stack]);

  // ---- Painting logic
  const [isPainting, setIsPainting] = useState(false);
  const paintValueRef = useRef<number>(1);

  const startPaint = useCallback((key: string, e: React.MouseEvent) => {
    e.preventDefault();
    const curr = clamp01(range[key] ?? 0);
    const value = e.shiftKey ? 0.5 : e.button === 2 ? 0 : nextCycle(curr);
    paintValueRef.current = value;
    setWeight(key, value);
    setIsPainting(true);
  }, [range, setWeight]);

  const movePaint = useCallback((key: string, e: React.MouseEvent) => {
    if (!isPainting) return;
    e.preventDefault();
    setWeight(key, paintValueRef.current);
  }, [isPainting, setWeight]);

  const stopPaint = () => setIsPainting(false);

  useEffect(() => {
    const up = async () => {
      setIsPainting(false);
      await flushNow(); // FLUSH tại mouseup
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [flushNow]);

  const matrix: string[][] = useMemo(() => {
    const m: string[][] = [];
    for (let i = 0; i < 13; i++) {
      const row: string[] = [];
      for (let j = 0; j < 13; j++) row.push(keyFor(i, j, orientation));
      m.push(row);
    }
    return m;
  }, [orientation]);

  const selectAllPairs = () => {
    const keys: string[] = [];
    for (let i = 0; i < 13; i++) keys.push(keyFor(i, i, orientation));
    bulkPaint(keys, 1);
  };
  const clearAll = () => bulkPaint(Object.values(matrix).flat(), 0);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* truyền trạng thái vào toolbar để hiển thị góc phải */}
      <RangeToolbar />

      <div className="rounded-2xl bg-slate-900/60 p-4 shadow">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-lg font-semibold text-slate-200">Hand Range</div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button onClick={selectAllPairs} className="rounded-lg bg-slate-700 px-3 py-1 hover:bg-slate-600">All Pairs</button>
            <button onClick={clearAll} className="rounded-lg bg-slate-700 px-3 py-1 hover:bg-slate-600">Clear Grid</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-8" />
                {RANKS.map((r) => (
                  <th key={r} className="w-12 select-none text-center text-sm font-semibold text-slate-300">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody onContextMenu={(e) => e.preventDefault()}>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <th className="w-8 select-none pr-2 text-right text-sm font-semibold text-slate-300">{RANKS[i]}</th>
                  {row.map((cellKey, j) => {
                    const w = clamp01(range[cellKey] ?? 0);
                    const sel = w > 0;
                    return (
                      <td key={`${i}-${j}`}>
                        <div
                          onMouseDown={(e) => startPaint(cellKey, e)}
                          onMouseEnter={(e) => movePaint(cellKey, e)}
                          onMouseUp={stopPaint}
                          className={`flex h-10 w-12 cursor-pointer items-center justify-center rounded-md border text-xs font-semibold text-slate-100 transition-colors ${weightToClass(w)} ${sel ? "ring-1 ring-white/10" : ""}`}
                          title={`${labelForKey(cellKey)} — ${Math.round(w * 100)}%`}
                        >
                          {labelForKey(cellKey)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 md:grid-cols-4">
      <div className="flex items-center gap-2"><span className="h-4 w-6 rounded bg-blue-600" />100%</div>
      <div className="flex items-center gap-2"><span className="h-4 w-6 rounded bg-green-700" />75%</div>
      <div className="flex items-center gap-2"><span className="h-4 w-6 rounded bg-yellow-500" />50%</div>
      <div className="flex items-center gap-2"><span className="h-4 w-6 rounded bg-red-600" />25%</div>
      <div className="flex items-center gap-2"><span className="h-4 w-6 rounded bg-slate-800" />0%</div>
    </div>
  );
}