import { Card, CardContent } from '@/components/ui/card';

export function LanguageBar() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">Language</h2>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm">
              <span>English</span>
              <span>94.4%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded">
              <div className="h-2 bg-black rounded" style={{ width: '94.4%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Spanish</span>
              <span>5.6%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded">
              <div className="h-2 bg-black rounded" style={{ width: '5.6%' }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
