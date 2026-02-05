export const KeyboardHint = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4">
      <div className="flex items-center gap-2">
        <kbd className="kbd px-4 py-2 text-base">Enter</kbd>
        <span className="text-muted-foreground">Present</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="kbd px-4 py-2 text-base">Shift</kbd>
        <span className="text-muted-foreground">Absent</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="kbd px-3 py-2 text-base">↑</kbd>
        <kbd className="kbd px-3 py-2 text-base">↓</kbd>
        <span className="text-muted-foreground">Navigate</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="kbd px-4 py-2 text-base">Esc</kbd>
        <span className="text-muted-foreground">Finish</span>
      </div>
    </div>
  );
};
