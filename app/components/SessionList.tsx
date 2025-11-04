"use client";

import { useSessionStore } from "@/lib/store/sessionStore";


export default function SessionList() {
  const { sessions, deleteSession } = useSessionStore();
  if (sessions.length === 0)
    return (
      <p className="text-gray-400 text-center">
        No sessions recorded yet. Start by adding one above!
      </p>
    );

    return (
    <div className="overflow-x-auto bg-gray-900 rounded-xl shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-800 text-gray-300">
            <th className="p-3">Date</th>
            <th className="p-3">Type</th>
            <th className="p-3">Buy-In</th>
            <th className="p-3">Cash-Out</th>
            <th className="p-3">Profit</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Notes</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              className="border-t border-gray-800 hover:bg-gray-800 transition"
            >
              <td className="p-3">{s.date}</td>
              <td className="p-3 capitalize">{s.type}</td>
              <td className="p-3">${typeof s.buy_in === "number" ? s.buy_in.toFixed(2) : "—"}</td>
              <td className="p-3">${typeof s.cash_out === "number" ? s.cash_out.toFixed(2) : "—"}</td>
              <td
                className={`p-3 font-semibold ${
                  s.profit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                ${typeof s.profit === "number" ? s.profit.toFixed(2) : "—"}
              </td>
              <td className="p-3">{s.duration}h</td>
              <td className="p-3">{s.notes || "-"}</td>
              <td className="p-3">
                <button
                  onClick={() => deleteSession(s.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
