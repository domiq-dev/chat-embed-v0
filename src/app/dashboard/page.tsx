"use client";

import { useEffect, useState } from "react";
import { KPICards } from "./components/KPICards";
import CallVolumeChart from "./components/CallVolumeChart";
import PreleaseHeatmap from "./components/PreleaseHeatmap";
import PreleaseTabs from "./components/PreleaseTabs";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    callCount: number;
    medianDuration: number;
    avgMessagesPerCall: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/elevenlabs/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  return (
    <div className="space-y-6 md:space-y-10">
      <h1 className="text-xl md:text-2xl font-bold">Your Property Intelligence Dashboard</h1>

      {/* Only render KPICards after stats are loaded */}
      {stats ? (
        <KPICards
          callCount={stats.callCount}
          medianDuration={stats.medianDuration}
          avgMessages={stats.avgMessagesPerCall}
        />
      ) : (
        <p>Loading stats...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <CallVolumeChart />
        <PreleaseHeatmap />
      </div>

      <PreleaseTabs />
    </div>
  );
}
