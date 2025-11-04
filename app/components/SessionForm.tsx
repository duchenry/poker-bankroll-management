"use client";

import { useSessionStore } from "@/lib/store/sessionStore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function SessionForm() {
  const addSession = useSessionStore((state) => state.addSession);

  const [date, setDate] = useState("");
  const [type, setType] = useState("low"); // default low stake
  const [buyIn, setBuyIn] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const buyInNum = parseFloat(buyIn);
    const cashOutNum = parseFloat(cashOut);
    const durationNum = parseFloat(duration);

    if (isNaN(buyInNum) || isNaN(cashOutNum)) return;

    const profit = cashOutNum - buyInNum;

    const newSession = {
      id: uuidv4(),
      date,
      type,
      buy_in: buyInNum,
      cash_out: cashOutNum,
      profit,
      duration: durationNum || 0,
      notes,
    };
    console.log("newSession", newSession)

    addSession(newSession);

    // Reset form
    setDate("");
    setType("low");
    setBuyIn("");
    setCashOut("");
    setDuration("");
    setNotes("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Game Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="low">Low Stake</option>
            <option value="mid">Mid Stake</option>
            <option value="high">High Stake</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Buy-In ($)</label>
          <input
            type="number"
            value={buyIn}
            onChange={(e) => setBuyIn(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Cash-Out ($)</label>
          <input
            type="number"
            value={cashOut}
            onChange={(e) => setCashOut(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Duration (hrs)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 h-20 resize-none"
          placeholder="e.g. Played well, lost to variance..."
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
      >
        Add Session
      </button>
    </form>
  );
}
