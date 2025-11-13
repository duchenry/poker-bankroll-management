import { StackProfile, Street, useRangeStore } from "@/lib/store/rangeStore";

export default function RangeToolbar() {
  const { orientation, setOrientation, setStreet, street, setStack, stack } = useRangeStore();
  const STREETS: Street[] = ["preflop", "flop", "turn", "river"];
  const STACKS: StackProfile[] = ["Deep", "Mid", "Short", "PushFold"];
  const handleStreetChange = async (s: Street) => {
    setStreet(s);
    // RangeGrid sẽ tự load autosave của street này ở effect — không cần load ở đây
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-900/60 p-3 shadow">
      <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1">
        {STREETS.map((s) => (
          <button
            key={s}
            onClick={() => handleStreetChange(s)}
            className={`px-3 py-2 text-xs rounded-lg ${s === street ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/40"}`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>
            {/* Stack selector */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1">
        {STACKS.map((k) => (
          <button
            key={k}
            onClick={() => setStack(k)}
            className={`px-3 py-2 text-xs rounded-lg ${k === stack ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/40"}`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-300">Triangle:</label>
        <select
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm ring-1 ring-slate-700"
          value={orientation}
          onChange={(e) => setOrientation(e.target.value as any)}
        >
          <option value="upperSuited">Upper = suited</option>
          <option value="upperOffsuit">Upper = offsuit</option>
        </select>
      </div>
    </div>
  );
}
