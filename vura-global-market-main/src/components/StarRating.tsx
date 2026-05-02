import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({ value, onChange, size = 24, readOnly = false, className }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={cn("inline-flex items-center gap-1", className)} role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={cn(
              "transition",
              !readOnly && "cursor-pointer hover:scale-110",
              readOnly && "cursor-default",
            )}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                "transition-colors",
                filled ? "fill-primary text-primary" : "fill-transparent text-muted-foreground",
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
