"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dummy dataset
const insights = [
  {
    name: "Cindy Chang",
    questions: 8,
    summary: "Asked about pricing and amenities.",
    signed: true,
    duration: "2m 14s",
    score: "A+",
    audio: "/recordings/cindy.mp3",
  },
  {
    name: "Tom Chen",
    questions: 6,
    summary: "Inquired about pet policies and parking.",
    signed: true,
    duration: "1m 45s",
    score: "A",
    audio: "/recordings/tom.mp3",
  },
];

export default function ClientRecordModal() {
  const params = useSearchParams();
  const personId = params.get("id");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (personId) {
      const match = insights.find((i) => i.name === personId);
      if (match) setSelected(match);
    }
  }, [personId]);

  const getScoreColor = (score: string) =>
    score === "A+" ? "bg-green-200 text-green-800" :
    score === "A" ? "bg-yellow-200 text-yellow-800" :
    "bg-red-200 text-red-800";

  return (
    <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{selected?.name}</DialogTitle>
        </DialogHeader>
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Score:</strong>{" "}
              <span className={cn("px-2 py-1 rounded text-xs font-semibold", getScoreColor(selected.score))}>
                {selected.score}
              </span>
            </p>
            <p><strong>Questions:</strong> {selected.questions}</p>
            <p><strong>Signed:</strong> {selected.signed ? "Yes ✅" : "No ❌"}</p>
            <p><strong>Duration:</strong> {selected.duration}</p>
            <p><strong>Summary:</strong> <br /> {selected.summary}</p>
            <div>
              <p className="font-semibold">Recording:</p>
              <audio controls className="w-full mt-1">
                <source src={selected.audio} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
