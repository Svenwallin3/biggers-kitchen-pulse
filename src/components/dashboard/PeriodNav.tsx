import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  sublabel?: string;
}

export function PeriodNav({ label, onPrev, onNext, prevDisabled, nextDisabled, sublabel }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-lg px-2 py-1.5">
      <button
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label="Previous period"
        className={cn(
          "p-2 rounded-md transition-colors",
          prevDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="text-center min-w-0">
        <div className="text-sm font-semibold truncate">{label}</div>
        {sublabel && <div className="text-[11px] text-muted-foreground truncate">{sublabel}</div>}
      </div>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="Next period"
        className={cn(
          "p-2 rounded-md transition-colors",
          nextDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
