// src/lib/db.ts
import { supabase } from "@/integrations/supabase/client";

export async function createScreen(user_id: string, name: string, config: object) {
  const { data, error } = await supabase.from("screens").insert([{ user_id, name, config }]).select().single();
  if (error) throw error;
  return data;
}

export async function listScreens(user_id: string) {
  const { data, error } = await supabase.from("screens").select("*").eq("user_id", user_id).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteScreen(id: string) {
  const { error } = await supabase.from("screens").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateScreen(id: string, updates: object) {
  const { data, error } = await supabase.from("screens").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
