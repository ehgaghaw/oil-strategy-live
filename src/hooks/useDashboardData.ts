import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  address: string;
  balance: number;
  barrels: number;
}

export interface DashboardData {
  treasuryValue: number;
  solBalance: number;
  solPrice: number;
  nav: number;
  backingRatio: number;
  isOverBacked: boolean;
  oilReserves: number;
  wtiPrice: number;
  sorPriceUsd: number;
  circulatingSupply: number;
  holdersCount: number;
  marketCap: number;
  tokenMintConfigured: boolean;
  leaderboard: LeaderboardEntry[];
}

export function useDashboardData(refreshInterval = 60000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "dashboard-data"
      );

      if (fnError) throw fnError;
      setData(result as DashboardData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}
