// lib/store/sessionStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

export interface Session {
  id: string;
  date: string;
  session_type: string;
  buy_in: number;
  cash_out: number;
  profit: number;
  notes: string;
  duration: number;
}

interface SessionStore {
  sessions: Session[];
  initialBankroll: number;
  loading: boolean;

  fetchSessions: () => Promise<void>;
  addSession: (s: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;

  fetchInitialBankroll: () => Promise<void>;
  setInitialBankroll: (value: number) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  initialBankroll: 0,
  loading: false,

  // 🧠 Lấy danh sách sessions từ Supabase
  fetchSessions: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("fetchSessions error:", error);
        set({ sessions: [] });
      } else {
        set({ sessions: (data as Session[]) || [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  },

  // ➕ Thêm session mới
  addSession: async (s: Session) => {
  set({ loading: true });
  try {
    const { error } = await supabase.from("sessions").insert([
      {
        date: s.date,
        session_type: s.session_type,
        buy_in: s.buy_in,
        cash_out: s.cash_out,
        notes: s.notes,
        duration: s.duration,
      },
    ]);

    if (error) {
      console.error("addSession error:", error.message || error);
    } else {
      await get().fetchSessions();
    }
  } catch (e) {
    console.error("addSession exception:", e);
  } finally {
    set({ loading: false });
  }
  },

    editSession: async (id: string, updatedFields:Partial<Session>) => {
    try {
      set(() => ({ loading: true, error: null }));

      const oldSession = get().sessions.find((s) => s.id === id);

      if (!oldSession) throw new Error("Session not found");

      const finalUpdate: Partial<Session> = {
        ...updatedFields,
        // profit: newProfit,
      };

      const { profit, ...safeUpdate } = finalUpdate;

      const { data, error } = await supabase
        .from("sessions")
        .update(safeUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) console.log(error);

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? (data as Session) : s
        ),
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      set(() => ({
        error: err.message || "Failed to update session",
        loading: false,
      }));
    }
  },

  // ❌ Xóa session
  deleteSession: async (id: string) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) console.error("deleteSession error:", error);
      else await get().fetchSessions();
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  },

  // 💾 Lưu bankroll lên Supabase (bảng settings)
  setInitialBankroll: async (value: number) => {
    set({ initialBankroll: value });
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "bankroll", value });
      if (error) console.error("setInitialBankroll error:", error);
    } catch (e) {
      console.error("setInitialBankroll exception:", e);
    }
  },

  // 🧠 Lấy bankroll từ Supabase khi load app
  fetchInitialBankroll: async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "bankroll")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = "No rows found", tức là chưa có bankroll
        console.error("fetchInitialBankroll error:", error);
      }

      if (data?.value !== undefined) {
        set({ initialBankroll: Number(data.value) });
      } else {
        set({ initialBankroll: 0 });
      }
    } catch (e) {
      console.error("fetchInitialBankroll exception:", e);
    }
  },
}));
