"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dummyProspects, DummyProspect } from "@/lib/dummy-data";

// Define an interface for the pre-lease data structure
interface PreleaseEntry {
  name: string;
  signedDate: string;
  duration: string;
  questions: number;
  score: "A+" | "A" | "B" | "C"; // Assuming score is one of these
  // prospectId: string; // Optional: if you need to link back
}

// Function to generate deterministic "random" values based on a string seed
function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
  return Math.floor(normalized * (max - min + 1)) + min;
}

export default function PreleaseTabs() {
  const [selectedRow, setSelectedRow] = useState<PreleaseEntry | null>(null);
  const [preleasesData, setPreleasesData] = useState<PreleaseEntry[]>([]);

  useEffect(() => {
    // Generate the data on the client side after hydration to avoid server/client mismatch
    const data: PreleaseEntry[] = dummyProspects
      .filter(prospect => prospect.status === 'leased') // Only show leased prospects
      .slice(0, 2) // Take the first two leased prospects for this example
      .map((prospect: DummyProspect, index: number) => ({
        name: prospect.name,
        // Example: Generate a signed date from a few days ago
        signedDate: new Date(new Date().setDate(new Date().getDate() - (index * 2 + 5))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: `${seededRandom(prospect.name + 'duration1', 1, 2)}m ${seededRandom(prospect.name + 'duration2', 10, 59)}s`, // Deterministic duration based on name
        questions: seededRandom(prospect.name + 'questions', 5, 8), // Deterministic questions (5-8)
        score: index === 0 ? "A+" : "A", // Example scores
        // prospectId: prospect.id,
      }));
    setPreleasesData(data);
  }, []);

  const getScoreColor = (score: string) => {
    if (score === "A+") return "bg-green-200 text-green-800";
    if (score === "A") return "bg-yellow-200 text-yellow-800";
    return "bg-red-200 text-red-800";
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="w-full overflow-x-auto">
          <p className="text-base font-medium mb-3">Pre-Leases Signed</p>
          <table className="min-w-[600px] w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="py-2 text-left whitespace-nowrap">Name</th>
                <th className="py-2 text-left whitespace-nowrap">Signed</th>
                <th className="py-2 text-left whitespace-nowrap">Duration</th>
                <th className="py-2 text-left whitespace-nowrap">Questions</th>
                <th className="py-2 text-left whitespace-nowrap">Score</th>
              </tr>
            </thead>
            <tbody>
              {preleasesData.map((item, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-muted cursor-pointer"
                  onClick={() => setSelectedRow(item)}
                >
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.signedDate}</td>
                  <td className="py-2">{item.duration}</td>
                  <td className="py-2">{item.questions}</td>
                  <td className="py-2">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-semibold",
                      getScoreColor(item.score)
                    )}>
                      {item.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Modal for Prelease Detail */}
      <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRow?.name}</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-2 text-sm">
              <p><strong>Signed Date:</strong> {selectedRow.signedDate}</p>
              <p><strong>Duration:</strong> {selectedRow.duration}</p>
              <p><strong>Questions:</strong> {selectedRow.questions}</p>
              <p><strong>Score:</strong> {selectedRow.score}</p>
              <div className="pt-3 flex justify-end">
                <Button variant="secondary" asChild>
                  <a href={`/dashboard/deep-insights?id=${encodeURIComponent(selectedRow.name)}`}>
                    View Full Record
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
