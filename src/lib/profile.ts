import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Weather } from "@/components/room/WeatherLayer";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  active_background_id: string | null;
  outdoor_weather: string;
  show_clock: boolean;
  show_stopwatch: boolean;
  lights_on: boolean;
  master_volume: number;
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Profile, "id">>) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

export function asWeather(value: string | undefined): Weather {
  const allowed: Weather[] = ["clear", "rain", "snow", "autumn", "night"];
  return allowed.includes(value as Weather) ? (value as Weather) : "rain";
}
