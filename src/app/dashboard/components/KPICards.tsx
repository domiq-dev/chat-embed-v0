import { Card, CardContent } from "@/components/ui/card";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function KPICards({
  callCount,
  medianDuration,
  avgMessages,
}: {
  callCount: number;
  medianDuration: number;
  avgMessages: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Number of Calls</p>
          <p className="text-3xl font-bold">{callCount ?? 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Median Call Duration</p>
          <p className="text-3xl font-bold">{formatDuration(medianDuration ?? 0)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Avg. Questions per Call</p>
          <p className="text-3xl font-bold">{avgMessages?.toFixed(1) ?? "0.0"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
