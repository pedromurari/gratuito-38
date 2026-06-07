import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  label: string;
  className?: string;
}

export function ProgressBar({ percentage, label, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto mb-8", className)}>
      <div className="bg-muted rounded-full h-12 relative overflow-hidden border border-border">
        <div
          className="bg-progress-gradient h-full transition-all duration-1000 ease-out flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
          <span className="text-progress-foreground font-bold text-sm px-4 whitespace-nowrap">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
