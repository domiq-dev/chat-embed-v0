'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DeepInsightsModal({
  item,
  onClose,
}: {
  item: {
    name: string;
    questions: number;
    summary: string;
    signed: boolean;
    duration: string;
    score: string;
    audio?: string;
    qualified?: boolean;
    engaged?: boolean;
    tourIntent?: boolean;
  };
  onClose: () => void;
}) {
  const getScoreColor = (score: string) =>
    score === 'A+'
      ? 'bg-green-200 text-green-800'
      : score === 'A'
        ? 'bg-yellow-200 text-yellow-800'
        : 'bg-red-200 text-red-800';

  const renderCheck = (val?: boolean) => (val ? '✅' : val === false ? '❌' : '—');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p>
            <strong>Score:</strong>{' '}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(item.score)}`}
            >
              {item.score}
            </span>
          </p>

          <p>
            <strong>Questions:</strong> {item.questions}
          </p>

          <p>
            <strong>Signed:</strong> {item.signed ? 'Yes ✅' : 'No ❌'}
          </p>

          <p>
            <strong>Duration:</strong> {item.duration}
          </p>

          <div className="grid grid-cols-2 gap-y-2">
            <p>
              <strong>Qualified:</strong> {renderCheck(item.qualified)}
            </p>
            <p>
              <strong>Engaged:</strong> {renderCheck(item.engaged)}
            </p>
            <p>
              <strong>Tour Intent:</strong> {renderCheck(item.tourIntent)}
            </p>
            <p>
              <strong>Pre-Lease:</strong> {renderCheck(item.signed)}
            </p>
          </div>

          <p>
            <strong>Summary:</strong>
            <br />
            {item.summary}
          </p>

          {item.audio && (
            <div>
              <p className="font-semibold">Recording:</p>
              <audio controls className="w-full mt-1">
                <source src={item.audio} type="audio/mpeg" />
              </audio>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
