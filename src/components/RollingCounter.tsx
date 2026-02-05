import { useRef } from 'react';
import { Student } from '@/data/students';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface RollingCounterProps {
  previous: Student | null;
  current: Student;
  next: Student | null;
  attendanceMap: Map<string, 'present' | 'absent'>;
  direction: 'up' | 'down';
}

const StatusBadge = ({ status }: { status: 'present' | 'absent' | null }) => {
  if (status === null) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
        status === 'present' ? 'status-present' : 'status-absent'
      )}
    >
      {status === 'present' ? (
        <>
          <Check className="w-4 h-4" />
          Present
        </>
      ) : (
        <>
          <X className="w-4 h-4" />
          Absent
        </>
      )}
    </span>
  );
};

const StudentRow = ({
  student,
  variant,
  status,
}: {
  student: Student | null;
  variant: 'previous' | 'current' | 'next';
  status: 'present' | 'absent' | null;
}) => {
  if (!student) {
    return (
      <div className={cn(
        "py-2 text-center transition-all duration-500 ease-out",
        variant === 'previous' && "opacity-25 scale-95",
        variant === 'next' && "opacity-25 scale-95"
      )}>
        <div className="text-muted-foreground/30 text-3xl">—</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "py-2 text-center transition-all duration-500 ease-out",
        variant === 'previous' && "opacity-25 scale-95",
        variant === 'current' && "opacity-100 scale-100",
        variant === 'next' && "opacity-25 scale-95"
      )}
    >
      <div className="flex flex-col items-center gap-0">
        <span className={cn(
          "font-mono tracking-wide transition-all duration-500",
          variant === 'current' ? "text-2xl text-primary font-semibold" : "text-lg text-muted-foreground"
        )}>
          {student.rollNumber}
        </span>
        <span className={cn(
          "font-bold tracking-tight transition-all duration-500 leading-tight text-center px-4",
          variant === 'current' ? "text-[8vw] md:text-[6vw] lg:text-[5vw] text-foreground" : "text-2xl md:text-3xl text-muted-foreground"
        )}>
          {student.name}
        </span>
        {status && (
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        )}
      </div>
    </div>
  );
};

export const RollingCounter = ({
  previous,
  current,
  next,
  attendanceMap,
  direction,
  onMoveUp,
  onMoveDown,
}: RollingCounterProps & {
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const handleWheel = (e: React.WheelEvent) => {
    // Simple threshold to prevent accidental triggers
    if (Math.abs(e.deltaY) < 20) return;

    if (e.deltaY > 0) {
      onMoveDown();
    } else {
      onMoveUp();
    }
  };

  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // Threshold of 30px
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        onMoveDown();
      } else {
        onMoveUp();
      }
      touchStartY.current = null; // Reset to prevent continuous scrolling
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <div
      className="py-2 overflow-hidden cursor-ns-resize touch-none select-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        key={current.rollNumber}
        className={cn(
          "flex flex-col items-center",
          direction === 'down' ? "animate-roll-up" : "animate-roll-down"
        )}
      >
        <StudentRow
          student={previous}
          variant="previous"
          status={previous ? attendanceMap.get(previous.rollNumber) || null : null}
        />
        <div className="py-1">
          <StudentRow
            student={current}
            variant="current"
            status={attendanceMap.get(current.rollNumber) || null}
          />
        </div>
        <StudentRow
          student={next}
          variant="next"
          status={next ? attendanceMap.get(next.rollNumber) || null : null}
        />
      </div>
    </div>
  );
};
