// "use client";
//
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { Card, CardContent } from "@/components/ui/card";
//
// const data = [
//   { date: "Apr 08", calls: 14 },
//   { date: "Apr 10", calls: 21 },
//   { date: "Apr 12", calls: 25 },
//   { date: "Apr 14", calls: 18 },
//   { date: "Apr 16", calls: 23 },
// ];
//
// export default function CallVolumeChart() {
//   return (
//     <Card className="w-full">
//       <CardContent className="p-4">
//         <p className="text-sm font-medium mb-2">Daily Number of Calls</p>
//         <div className="w-full h-[250px] sm:h-[300px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="calls"
//                 stroke="#7c3aed"
//                 strokeWidth={2}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function CallVolumeChart() {
  const [data, setData] = useState<{ date: string; calls: number }[]>([]);

  useEffect(() => {
    fetch("/api/elevenlabs/stats/daily")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch chart data:", err));
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <p className="text-sm font-medium mb-2">Daily Number of Calls</p>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#7c3aed"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
