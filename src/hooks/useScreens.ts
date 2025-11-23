// src/hooks/useScreens.ts
import { useQuery } from "@tanstack/react-query";
import { listScreens } from "@/lib/db";
import { useAuthContext } from "@/context/AuthContext";

export function useScreens() {
  const { user } = useAuthContext();
  return useQuery(["screens", user?.id], () => listScreens(user!.id), { enabled: !!user?.id });
}
