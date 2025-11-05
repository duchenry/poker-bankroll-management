"use client";

import { useState } from "react";
import { useSessionStore } from "@/lib/store/sessionStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


export default function SessionList() {
  const { sessions, deleteSession, editSession, loading } = useSessionStore();
  const [editingSession, setEditingSession] = useState<any | null>(null);

  const handleSave = async () => {
    if (!editingSession) return;

    const { id, ...updatedFields } = editingSession;
    await editSession(id, updatedFields);
    setEditingSession(null);
  };

  if (sessions.length === 0)
    return (
      <p className="text-gray-400 text-center">
        No sessions recorded yet. Start by adding one above!
      </p>
    );
    console.log("session", sessions)

  return (
    <>
      {/* TABLE */}
      <div className="overflow-x-auto bg-gray-900 rounded-xl shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="p-3">Date</th>
              <th className="p-3">Session Type</th>
              <th className="p-3">Buy-In</th>
              <th className="p-3">Cash-Out</th>
              <th className="p-3">Profit</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const shortNotes = s.notes.length > 80 ? s.notes.slice(0, 80) + "..." : s.notes;
              return (
              <tr
                key={s.id}
                className="border-t border-gray-800 hover:bg-gray-800 transition"
              >
                <td className="p-3">{s.date}</td>
                <td className="p-3 capitalize">{s.session_type}</td>
                <td className="p-3">
                  ${typeof s.buy_in === "number" ? s.buy_in.toFixed(2) : "—"}
                </td>
                <td className="p-3">
                  ${typeof s.cash_out === "number" ? s.cash_out.toFixed(2) : "—"}
                </td>
                <td
                  className={`p-3 font-semibold ${
                    s.profit >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ${typeof s.profit === "number" ? s.profit.toFixed(2) : "—"}
                </td>
                <td className="p-3">{s.duration}h</td>
                <td className="">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-left text-sm text-gray-300 hover:text-white transition-all line-clamp-2">
                        {shortNotes}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Notes</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm whitespace-pre-line text-gray-700">
                        {s.notes}
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setEditingSession(s)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg mb-5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSession(s.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Session</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={editingSession.date}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, date: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Session Type</label>
                <select
                  value={editingSession.session_type}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, session_type: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                >
                  <option value="low">Low stake</option>
                  <option value="mid">Mid stake</option>
                  <option value="high">High stake</option>
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-gray-300 mb-1">Buy-In</label>
                  <input
                    type="number"
                    value={editingSession.buy_in}
                    onChange={(e) =>
                      setEditingSession({
                        ...editingSession,
                        buy_in: Number(e.target.value),
                      })
                    }
                    className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-gray-300 mb-1">Cash-Out</label>
                  <input
                    type="number"
                    value={editingSession.cash_out}
                    onChange={(e) =>
                      setEditingSession({
                        ...editingSession,
                        cash_out: Number(e.target.value),
                      })
                    }
                    className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Duration (h)</label>
                <input
                  type="number"
                  value={editingSession.duration}
                  onChange={(e) =>
                    setEditingSession({
                      ...editingSession,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Notes</label>
                <textarea
                  value={editingSession.notes || ""}
                  onChange={(e) =>
                    setEditingSession({
                      ...editingSession,
                      notes: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setEditingSession(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
