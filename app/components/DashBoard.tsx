"use client";
import { useSessionStore } from "@/lib/store/sessionStore";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const {
    sessions,
    initialBankroll,
    setInitialBankroll,
    fetchInitialBankroll,
    fetchSessions,
  } = useSessionStore();
  const [tempValue, setTempValue] = useState(initialBankroll.toString());

  // 🧠 Load bankroll + sessions khi mở app
  useEffect(() => {
    fetchInitialBankroll();
    fetchSessions();
  }, []);

  useEffect(() => {
    setTempValue(initialBankroll.toString());
  }, [initialBankroll]);

  const totalProfit = sessions.reduce((acc, s) => acc + s.profit, 0);
  const currentBankroll = initialBankroll + totalProfit;
  const totalSessions = sessions.length;
  const avgProfit = totalSessions ? totalProfit / totalSessions : 0;

  const handleSaveBankroll = () => {
    const parsed = parseFloat(tempValue);
    if (!isNaN(parsed)) setInitialBankroll(parsed);
  };

  // Chart data
  const chartData = useMemo(() => {
    let bankroll = initialBankroll;
    return sessions.map((s, index) => {
      bankroll += s.profit;
      return {
        name: `#${index + 1}`,
        bankroll,
        profit: s.profit,
        date: s.date || `Session ${index + 1}`,
      };
    });
  }, [sessions, initialBankroll]);
  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">📊 Bankroll Dashboard</h2>

      {/* Initial bankroll input */}
      {tempValue !== "0" 
      ? <div className="p-3 mb-1 text-2xl font-bold"><h1>Session</h1></div>
      : <div className="mb-6 flex items-center gap-2">
        <input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-40"
          placeholder="Initial Bankroll"
        />
        <button
          onClick={handleSaveBankroll}
          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
        >
          Save
        </button>
      </div>
      }
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Initial Bankroll</p>
          <p className="text-xl font-semibold">${initialBankroll.toFixed(2)}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Current Bankroll</p>
          <p className="text-xl font-semibold">${currentBankroll.toFixed(2)}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Total Profit</p>
          <p
            className={`text-xl font-semibold ${
              totalProfit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ${totalProfit.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Avg / Session</p>
          <p className="text-xl font-semibold">${avgProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-center">
          📈 Bankroll Progress
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="bankroll"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">
            Add your first session to see bankroll progress.
          </p>
        )}
      </div>
    </div>
  );
}
