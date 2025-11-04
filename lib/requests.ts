// src/lib/requests.js
import { createClient } from "@supabase/supabase-js";

// 🔑 Supabase project info
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// 🧾 Lấy toàn bộ sessions từ database
export const fetchSessions = async () => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchSessions error:", error);
    throw error;
  }
  return data;
};

// ➕ Thêm 1 session mới vào database
export const addSession = async (session: any) => {
  const { data, error } = await supabase
    .from("sessions")
    .insert([session])
    .select();

  if (error) {
    console.error("addSession error:", error);
    throw error;
  }
  return data[0];
};
