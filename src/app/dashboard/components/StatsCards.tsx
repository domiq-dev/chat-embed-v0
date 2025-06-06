import { Card, CardContent } from '@/components/ui/card';

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Conversations</p>
          <p className="text-2xl font-bold">243</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Converted Leads</p>
          <p className="text-2xl font-bold">28</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Avg. Response Time</p>
          <p className="text-2xl font-bold">6.2s</p>
        </CardContent>
      </Card>
    </div>
  );
}
