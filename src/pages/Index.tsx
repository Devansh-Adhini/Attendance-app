import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import { allStudents, getCseCount, Student } from '@/data/students';
import { BranchSelector } from '@/components/BranchSelector';
import { RollingCounter } from '@/components/RollingCounter';
import { KeyboardHint } from '@/components/KeyboardHint';
import { AttendanceReview } from '@/components/AttendanceReview';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, LogOut } from 'lucide-react';

type AppState = 'select' | 'marking' | 'review';

interface IndexProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const [appState, setAppState] = useState<AppState>('select');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, 'present' | 'absent'>>(new Map());
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  const handleStart = (startIndex: number) => {
    // Keep all students, just set the starting position
    setStudents(allStudents);
    setCurrentIndex(startIndex - 1); // Convert 1-based to 0-based index
    setAttendanceMap(new Map());
    setAppState('marking');
  };

  const markAttendance = useCallback((status: 'present' | 'absent') => {
    if (appState !== 'marking' || currentIndex >= students.length) return;

    const student = students[currentIndex];
    setAttendanceMap(prev => {
      const newMap = new Map(prev);
      newMap.set(student.rollNumber, status);
      return newMap;
    });

    if (currentIndex < students.length - 1) {
      setDirection('down');
      setCurrentIndex(prev => prev + 1);
    } else {
      setAppState('review');
    }
  }, [appState, currentIndex, students]);

  const moveUp = useCallback(() => {
    if (appState !== 'marking' || currentIndex <= 0) return;
    setDirection('up');
    setCurrentIndex(prev => prev - 1);
  }, [appState, currentIndex]);

  const moveDown = useCallback(() => {
    if (appState !== 'marking' || currentIndex >= students.length - 1) return;
    setDirection('down');
    setCurrentIndex(prev => prev + 1);
  }, [appState, currentIndex, students.length]);

  const finishEarly = useCallback(() => {
    if (attendanceMap.size > 0) {
      setAppState('review');
    }
  }, [attendanceMap.size]);

  useEffect(() => {
    if (appState !== 'marking') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        markAttendance('present');
      } else if (e.key === 'Shift') {
        e.preventDefault();
        markAttendance('absent');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveDown();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finishEarly();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, markAttendance, moveUp, moveDown, finishEarly]);

  const handleUpdateStatus = (rollNumber: string, status: 'present' | 'absent') => {
    setAttendanceMap(prev => {
      const newMap = new Map(prev);
      newMap.set(rollNumber, status);
      return newMap;
    });
  };

  const handleDeleteRecord = (rollNumber: string) => {
    setAttendanceMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(rollNumber);
      return newMap;
    });
  };

  const handleSubmit = async (remarks: string) => {
    try {
      // 1. Create Identifier
      const { data: identifierData, error: idError } = await supabase
        .from('Identifier')
        .insert([{ remark: remarks }])
        .select()
        .single();

      if (idError) throw idError;

      const hash = identifierData.Hash;

      // 2. Prepare Attendance Records
      const records = allStudents.map(student => {
        const status = attendanceMap.get(student.rollNumber);
        let attendanceValue: number | null = null;

        if (status === 'present') attendanceValue = 1;
        else if (status === 'absent') attendanceValue = 0;

        return {
          Hash: hash,
          id: student.rollNumber,
          Name: student.name,
          Attendance: attendanceValue
        };
      });

      // 3. Insert Attendance
      const { error: attError } = await supabase
        .from('Attendance')
        .insert(records);

      if (attError) throw attError;

      const presentCount = Array.from(attendanceMap.values()).filter(s => s === 'present').length;
      const absentCount = Array.from(attendanceMap.values()).filter(s => s === 'absent').length;

      console.log('Attendance submitted to Supabase successfully');

      alert(`Attendance Submitted Successfully!\n${presentCount} present, ${absentCount} absent`);

      setAppState('select');
      setAttendanceMap(new Map());
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance. Please try again.');
    }
  };

  const current = students[currentIndex];
  const previous = currentIndex > 0 ? students[currentIndex - 1] : null;
  const next = currentIndex < students.length - 1 ? students[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            <h1 className="font-semibold text-lg">Attendance</h1>
          </div>
          <div className="flex items-center gap-4">
            {appState === 'marking' && (
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {students.length}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-8 ${appState === 'marking' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {appState === 'select' && (
          <BranchSelector onStart={handleStart} cseCount={getCseCount()} />
        )}

        {appState === 'marking' && current && (
          <div className="space-y-6">
            <RollingCounter
              previous={previous}
              current={current}
              next={next}
              attendanceMap={attendanceMap}
              direction={direction}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
            />
            <KeyboardHint />

            {/* Mobile buttons */}
            <div className="flex flex-col gap-4 md:hidden">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 h-16 text-lg border-2 border-success text-success hover:bg-success hover:text-success-foreground"
                  onClick={() => markAttendance('present')}
                >
                  Present
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-16 text-lg border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => markAttendance('absent')}
                >
                  Absent
                </Button>
              </div>
              <Button
                variant="secondary"
                className="w-full h-12 text-lg"
                onClick={finishEarly}
              >
                Finish Early
              </Button>
            </div>
          </div>
        )}

        {appState === 'review' && (
          <AttendanceReview
            students={students.filter(s => attendanceMap.has(s.rollNumber))}
            attendanceMap={attendanceMap}
            onUpdateStatus={handleUpdateStatus}
            onDeleteRecord={handleDeleteRecord}
            onSubmit={handleSubmit}
            onBack={() => setAppState('marking')}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
