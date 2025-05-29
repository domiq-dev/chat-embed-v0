import { Card, CardContent } from "@/components/ui/card";

const leads = [
  { name: "Sarah Miller", status: "Interested", date: "2025-04-18" },
  { name: "Tom Chen", status: "Scheduled Tour", date: "2025-04-19" },
];

export function LeadsTable() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Leads</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-2">Name</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{lead.name}</td>
                <td>{lead.status}</td>
                <td>{lead.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
