import { supabase } from "../supabaseClient";
import type { Orientation, RangeMap, Street, StackProfile } from "../store/rangeStore";

const TABLE = "poker_ranges";
export const AUTOSAVE_NAME = "__autosave__";

const keyAuto = (street: Street, stack: StackProfile) => `${AUTOSAVE_NAME}::${street}::${stack}`;
const keyPreset = (street: Street, stack: StackProfile, name: string) => `${street}::${stack}::${name}`;

export type RangeDoc = {
  street: Street;
  stack: StackProfile;
  name: string;
  range: RangeMap;
  orientation: Orientation;
};

export async function loadAutosave(street: Street, stack: StackProfile) {
  const nameKey = keyAuto(street, stack);
  const { data, error } = await supabase.from(TABLE).select("name,data").eq("name", nameKey).maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;
  const payload = (data.data as any) ?? {};
  return {
    street,
    stack,
    name: AUTOSAVE_NAME,
    range: payload.range ?? {},
    orientation: payload.orientation ?? "upperSuited",
  } as RangeDoc;
}

export async function saveAutosave(street: Street, stack: StackProfile, range: RangeMap, orientation: Orientation) {
  const nameKey = keyAuto(street, stack);
  const row = { name: nameKey, data: { range, orientation, street, stack } };
  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: "name" }).select("name").single();
  if (error) throw error;
}

export async function upsertRange(doc: RangeDoc) {
  const nameKey = keyPreset(doc.street, doc.stack, doc.name);
  const row = { name: nameKey, data: { range: doc.range, orientation: doc.orientation, street: doc.street, stack: doc.stack } };
  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: "name" }).select("name").single();
  if (error) throw error;
}
