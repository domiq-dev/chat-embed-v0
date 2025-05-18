"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

// Dummy heatmap data (7x5 grid = 5 weeks)
const heatmap = [
  [1, 2, 2, 4, 3, 1, 0],
  [2, 3, 5, 8, 5, 2, 1],
  [3, 4, 7, 10, 6, 4, 2],
  [2, 4, 6, 9, 7, 3, 1],
  [1, 2, 3, 5, 4, 2, 1],
];

function getColor(count: number) {
  if (count >= 9) return "bg-purple-900";
  if (count >= 6) return "bg-purple-700";
  if (count >= 4) return "bg-purple-500";
  if (count >= 2) return "bg-purple-300";
  if (count >= 1) return "bg-purple-100";
  return "bg-gray-100";
}

export default function PreleaseHeatmap() {
  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <p className="text-sm font-medium mb-4">Pre-Lease Signatures by Day</p>

        <div className="overflow-x-auto">
          {/* Labels */}
          <div className="grid grid-cols-7 text-[11px] font-medium text-muted-foreground mb-2 min-w-[420px]">
            {days.map((day) => (
              <div key={day} className="text-center">{day}</div>
            ))}
          </div>

          {/* Heatmap squares */}
          <div className="grid grid-cols-7 gap-[2px] min-w-[420px]">
            {heatmap.map((week, weekIndex) =>
              week.map((count, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  title={`${count} pre-leases signed`}
                  onClick={() => {
                    console.log(`Clicked on Week ${weekIndex + 1}, ${days[dayIndex]} → ${count} preleases`);
                  }}
                  className={cn(
                    "aspect-square w-6 sm:w-7 md:w-8 rounded-sm cursor-pointer transition-all duration-200 ease-in-out",
                    getColor(count),
                    "hover:scale-110 hover:shadow-md"
                  )}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
