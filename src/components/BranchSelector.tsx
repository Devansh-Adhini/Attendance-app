import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { exportAttendanceToExcel } from '@/utils/exportUtils';
import { Download } from 'lucide-react';

interface BranchSelectorProps {
  onStart: (startIndex: number) => void;
  cseCount: number;
}

export const BranchSelector = ({ onStart, cseCount }: BranchSelectorProps) => {
  const [startRoll, setStartRoll] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleBranchStart = (branch: 'CSE' | 'AI') => {
    // CSE starts from startRoll, AI starts from cseCount + startRoll
    const actualStart = branch === 'CSE' ? startRoll : cseCount + startRoll;
    onStart(actualStart);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportAttendanceToExcel();
    setIsExporting(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 fade-slide-up">
      <h2 className="text-2xl font-semibold text-center">Start Attendance</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground whitespace-nowrap">Start from</span>
          <Input
            type="number"
            min={1}
            value={startRoll}
            onChange={(e) => setStartRoll(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 text-center text-lg font-mono"
          />
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => handleBranchStart('CSE')}
            className="flex-1 h-14 text-lg"
            size="lg"
          >
            CSE
          </Button>
          <Button
            onClick={() => handleBranchStart('AI')}
            variant="secondary"
            className="flex-1 h-14 text-lg"
            size="lg"
          >
            AI
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm text-muted-foreground mb-3">Quick Start</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onStart(1)}
            className="flex-1"
          >
            CSE 1
          </Button>
          <Button
            variant="outline"
            onClick={() => onStart(74)}
            className="flex-1"
          >
            CSE 74
          </Button>
          <Button
            variant="outline"
            onClick={() => onStart(cseCount + 1)}
            className="flex-1"
          >
            AI 1
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>
    </div >
  );
};
