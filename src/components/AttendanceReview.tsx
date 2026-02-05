import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Student } from '@/data/students';
import { Check, X, Edit2, Save, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AttendanceReviewProps {
  students: Student[];
  attendanceMap: Map<string, 'present' | 'absent'>;
  onUpdateStatus: (rollNumber: string, status: 'present' | 'absent') => void;
  onDeleteRecord: (rollNumber: string) => void;
  onSubmit: (remarks: string) => void;
  onBack: () => void;
}

export const AttendanceReview = ({
  students,
  attendanceMap,
  onUpdateStatus,
  onDeleteRecord,
  onSubmit,
  onBack,
}: AttendanceReviewProps) => {
  const [remarks, setRemarks] = useState('');
  const [editingRoll, setEditingRoll] = useState<string | null>(null);

  const presentCount = Array.from(attendanceMap.values()).filter(s => s === 'present').length;
  const absentCount = Array.from(attendanceMap.values()).filter(s => s === 'absent').length;

  const handleSubmit = () => {
    onSubmit(remarks);
  };

  const studentsWithRecords = students.filter(s => attendanceMap.has(s.rollNumber));

  return (
    <div className="space-y-6 fade-slide-up">
      {/* Summary */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">Review Attendance</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-success">
              <Check className="w-4 h-4" />
              {presentCount} Present
            </span>
            <span className="flex items-center gap-1 text-destructive">
              <X className="w-4 h-4" />
              {absentCount} Absent
            </span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Today: {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        {/* Student List */}
        <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
          {studentsWithRecords.map((student) => {
            const status = attendanceMap.get(student.rollNumber);
            const isEditing = editingRoll === student.rollNumber;

            return (
              <div
                key={student.rollNumber}
                className={cn(
                  "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
                  isEditing && "bg-accent"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-16">
                    {student.rollNumber}
                  </span>
                  <span className="text-sm">{student.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        variant={status === 'present' ? 'default' : 'outline'}
                        className={status === 'present' ? 'status-present' : ''}
                        onClick={() => onUpdateStatus(student.rollNumber, 'present')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={status === 'absent' ? 'default' : 'outline'}
                        className={status === 'absent' ? 'status-absent' : ''}
                        onClick={() => onUpdateStatus(student.rollNumber, 'absent')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          onDeleteRecord(student.rollNumber);
                          setEditingRoll(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingRoll(null)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          status === 'present' ? 'status-present' : 'status-absent'
                        )}
                      >
                        {status === 'present' ? 'P' : 'A'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingRoll(student.rollNumber)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remarks */}
      <div className="rounded-xl bg-card border border-border p-6">
        <Label htmlFor="remarks" className="text-sm text-muted-foreground">
          Remarks (optional)
        </Label>
        <Textarea
          id="remarks"
          placeholder="Any notes or corrections..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
      >
        Submit Attendance
      </Button>
    </div>
  );
};
