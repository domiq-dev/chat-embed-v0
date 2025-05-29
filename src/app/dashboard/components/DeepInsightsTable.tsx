"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Info,
  Download,
  Moon,
  Sun,
  CircleCheck,
  CircleX,
} from "lucide-react";
import DeepInsightsModal from "./DeepInsightsModal";
import { dummyProspects, DummyProspect } from "@/lib/dummy-data";

/* ───── Types & mock data ───── */
interface Insight {
  name: string;
  qualified: boolean;
  engaged: boolean;
  tourIntent: boolean;
  signed: boolean;
  questions: number;
  summary: string;
  duration: string;
  score: "A+" | "A" | "B" | "C";
}

const mockData: Insight[] = dummyProspects.slice(0, 2).map((prospect: DummyProspect, index: number) => ({
  name: prospect.name,
  qualified: index === 0 ? false : true,
  engaged: true,
  tourIntent: prospect.status === 'toured' || prospect.status === 'leased',
  signed: prospect.status === 'leased',
  questions: Math.floor(Math.random() * 5) + 5,
  summary: `Inquired about general property information. Status: ${prospect.status}`,
  duration: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 50) + 10}s`,
  score: index === 0 ? "A+" : "A",
}));

/* ───── small helpers ───── */
const Flag = ({ ok }: { ok: boolean }) => (
  <span
    className={`
      inline-flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-inset
      shadow-sm dark:shadow-none
      ${ok
        ? "bg-emerald-200/20 ring-emerald-400/40 text-emerald-300"
        : "bg-rose-200/20    ring-rose-400/40    text-rose-300"}
    `}
  >
    {ok ? (
      <CircleCheck className="h-3.5 w-3.5" strokeWidth={3} />
    ) : (
      <CircleX className="h-3.5 w-3.5" strokeWidth={3} />
    )}
  </span>
);

const ScorePill = ({ value }: { value: Insight["score"] }) => {
  const map = {
    "A+": "bg-emerald-300/10 text-emerald-200 ring-emerald-400/60",
    A:    "bg-lime-300/10    text-lime-200    ring-lime-400/60",
    B:    "bg-amber-300/10   text-amber-200   ring-amber-400/60",
    C:    "bg-rose-300/10    text-rose-200    ring-rose-400/60",
  } as const;
  return (
    <Badge variant="outline"
      className={`min-w-[3.1rem] justify-center font-semibold ring-1 ${map[value]}`}>
      {value}
    </Badge>
  );
};

/* ───── theme toggle ───── */
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = localStorage.getItem("di-theme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("di-theme", theme);
  }, [theme]);
  return (
    <Button size="icon" variant="ghost"
      aria-label="toggle theme"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
    </Button>
  );
}

/* ───── main component ───── */
export default function DeepInsightsTable() {
  const [selected,setSelected]=useState<Insight|null>(null);
  const [sortDesc,setSortDesc]=useState(true);
  const scoreRank:Record<Insight["score"],number>={ "A+":3,A:2,B:1,C:0 };
  const data=[...mockData].sort((a,b)=>
    sortDesc?scoreRank[b.score]-scoreRank[a.score]:scoreRank[a.score]-scoreRank[b.score]);

  const downloadCSV=()=>{
    const header="Name,Qualified,Engaged,TourIntent,PreLease,Questions,Summary,Duration,Score";
    const rows=data.map(i=>[
      i.name,i.qualified?"Yes":"No",i.engaged?"Yes":"No",i.tourIntent?"Yes":"No",
      i.signed?"Yes":"No",i.questions,`"${i.summary}"`,i.duration,i.score].join(","));
    const blob=new Blob([header,...rows] as BlobPart[],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="deep_insights.csv";a.click();
  };

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <Card className="shadow-xl ring-1 ring-border/50 dark:bg-black/70 dark:ring-white/10">
          <CardContent className="p-6">
            {/* header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground">Conversion Metrics</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help"/>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Funnel checkpoints captured during each conversation
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle/>
                <Button size="sm" variant="ghost" onClick={downloadCSV}
                  className="gap-1 text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4"/> CSV
                </Button>
              </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto rounded-md">
              <table className="min-w-full table-fixed text-sm">
                {/* header row */}
                <thead className="bg-gray-50/70 dark:bg-white/5 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-48">Name</th>
                    {["Qualified","Engaged","Tour Intent","Pre‑Lease"].map(l=>(
                      <th key={l} className="w-[56px] px-2 py-3 text-center font-medium">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 cursor-help">{l}
                              <Info className="h-3.5 w-3.5 text-muted-foreground"/>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="backdrop-blur-sm">
                            {({
                              Qualified:"Mentioned size, move‑in date & contact info",
                              Engaged:"Spoke for over 3 minutes",
                              "Tour Intent":"Asked to schedule a tour",
                              "Pre‑Lease":"Agreed to pre‑lease questions"
                            } as Record<string,string>)[l]}
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                    <th className="w-[90px] px-4 py-3 text-left font-medium">Questions</th>
                    <th className="w-[40%] px-4 py-3 text-left font-medium">Summary</th>
                    <th className="w-[80px] px-4 py-3 text-left font-medium">Duration</th>
                    <th
                      onClick={()=>setSortDesc(!sortDesc)}
                      className="w-[72px] px-4 py-3 text-left font-medium cursor-pointer select-none">
                      Score {sortDesc?"↓":"↑"}
                    </th>
                  </tr>
                </thead>

                {/* body */}
                <tbody>
                  {data.map((i,idx)=>(
                    <tr key={i.name}
                      onClick={()=>setSelected(i)}
                      className={`
                        cursor-pointer transition
                        ${idx%2?"bg-muted/10 dark:bg-white/5":""}
                        hover:bg-primary/5 dark:hover:bg-neon-mint/5
                      `}
                    >
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="py-3 text-center"><Flag ok={i.qualified}/></td>
                      <td className="py-3 text-center"><Flag ok={i.engaged}/></td>
                      <td className="py-3 text-center"><Flag ok={i.tourIntent}/></td>
                      <td className="py-3 text-center"><Flag ok={i.signed}/></td>
                      <td className="px-4 py-3 text-center">{i.questions}</td>
                      <td className="px-4 py-3 truncate">{i.summary}</td>
                      <td className="px-4 py-3">{i.duration}</td>
                      <td className="px-4 py-3"><ScorePill value={i.score}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>

      {selected && <DeepInsightsModal item={selected} onClose={()=>setSelected(null)}/> }
    </>
  );
}
