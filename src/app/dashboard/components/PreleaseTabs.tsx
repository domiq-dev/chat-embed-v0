"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const preleases = [
  { name: "Cindy Chang", signedDate: "Apr 12", duration: "2m 14s", questions: 8, score: "A+" },
  { name: "Tom Chen", signedDate: "Apr 10", duration: "1m 45s", questions: 6, score: "A" },
];

export default function PreleaseTabs() {
  const [selectedRow, setSelectedRow] = useState<(typeof preleases)[0] | null>(null);

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
              {preleases.map((item, i) => (
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
