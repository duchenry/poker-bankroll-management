"use client";

import Dashboard from "./components/DashBoard";
import SessionForm from "./components/SessionForm";
import SessionList from "./components/SessionList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🃏 Poker Bankroll Manager
        </h1>

        {/* Dashboard */}
        <Dashboard />

        {/* Add new session */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">➕ Add New Session</h2>
          <SessionForm />
        </section>

        {/* Session list */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">📘 All Sessions</h2>
          <SessionList />
        </section>
      </div>
    </main>
  );
}
