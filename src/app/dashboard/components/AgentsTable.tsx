import { Card, CardContent } from '@/components/ui/card';

const agents = [{ name: 'Demo', calls: 120, minutes: 61 }];

export function AgentsTable() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">Most Called Agents</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Agent Name</th>
              <th>Calls</th>
              <th>Minutes</th>
              {/*<th>Credits</th>*/}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, i) => (
              <tr key={i} className="border-t">
                <td>{agent.name}</td>
                <td>{agent.calls}</td>
                <td>{agent.minutes}</td>
                {/*<td>{agent.credits}</td>*/}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
