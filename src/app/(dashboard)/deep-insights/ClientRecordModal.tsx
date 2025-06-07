'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dummyProspects, DummyProspect } from '@/lib/dummy-data'; // Import dummyProspects

// Define an interface for the insight data used by the modal
interface ModalInsight {
  name: string;
  questions: number;
  summary: string;
  signed: boolean; // Represents pre-lease signed
  duration: string;
  score: 'A+' | 'A' | 'B' | 'C'; // Assuming score is one of these
  audio: string; // Path to audio file
  // prospectId: string; // Optional: if you need to link back
}

// Map dummyProspects to the structure needed for this modal
const insights: ModalInsight[] = dummyProspects
  .slice(0, 2)
  .map((prospect: DummyProspect, index: number) => ({
    name: prospect.name,
    questions: Math.floor(Math.random() * 5) + 5, // Random number of questions (5-9)
    summary: `Client expressed interest in ${prospect.status === 'leased' ? 'finalizing lease' : 'touring options'}. Touched upon amenities and unit availability.`,
    signed: prospect.status === 'leased', // True if prospect has leased
    duration: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 50) + 10}s`, // Random duration
    score: index === 0 ? 'A+' : 'A', // Example scores, e.g., first prospect gets A+, second A
    audio: index === 0 ? '/recordings/cindy.mp3' : '/recordings/tom.mp3', // Keep existing audio for now
    // prospectId: prospect.id,
  }));

export default function ClientRecordModal() {
  const params = useSearchParams();
  const personId = params.get('id'); // This will be the prospect's name based on current DeepInsightsTable click
  const [selected, setSelected] = useState<ModalInsight | null>(null);

  useEffect(() => {
    if (personId) {
      const match = insights.find((i) => i.name === personId);
      if (match) setSelected(match);
      else setSelected(null); // Clear if no match
    }
  }, [personId]);

  const getScoreColor = (score: string) =>
    score === 'A+'
      ? 'bg-green-200 text-green-800'
      : score === 'A'
        ? 'bg-yellow-200 text-yellow-800'
        : 'bg-red-200 text-red-800';

  return (
    <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{selected?.name}</DialogTitle>
        </DialogHeader>
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Score:</strong>{' '}
              <span
                className={cn(
                  'px-2 py-1 rounded text-xs font-semibold',
                  getScoreColor(selected.score),
                )}
              >
                {selected.score}
              </span>
            </p>
            <p>
              <strong>Questions:</strong> {selected.questions}
            </p>
            <p>
              <strong>Signed:</strong> {selected.signed ? 'Yes ✅' : 'No ❌'}
            </p>
            <p>
              <strong>Duration:</strong> {selected.duration}
            </p>
            <p>
              <strong>Summary:</strong> <br /> {selected.summary}
            </p>
            <div>
              <p className="font-semibold">Recording:</p>
              <audio controls className="w-full mt-1">
                <source src={selected.audio} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
