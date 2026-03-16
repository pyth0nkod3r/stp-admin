"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  hour: string;
  minute: string;
  period: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

function WheelColumn({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedRef = React.useRef<HTMLButtonElement>(null);
  const didMount = React.useRef(false);
  const wheelTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  // Scroll the selected item into center view
  React.useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = selectedRef.current;
      const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      if (!didMount.current) {
        container.scrollTop = top;
        didMount.current = true;
      } else {
        container.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [selected]);

  // Mouse wheel steps through items instead of native scrolling
  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Debounce rapid wheel events
      if (wheelTimeout.current) return;
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = undefined;
      }, 60);

      const currentIndex = items.indexOf(selected);
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
      if (nextIndex !== currentIndex) {
        onSelect(items[nextIndex]);
      }
    },
    [items, selected, onSelect]
  );

  return (
    <div className="relative" onWheel={handleWheel}>
      {/* Fade masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-popover to-transparent rounded-t-md" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-popover to-transparent rounded-b-md" />
      {/* Selection highlight band */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[5] h-8 -translate-y-1/2 rounded-md bg-primary/10 border border-primary/20" />

      <div
        ref={containerRef}
        className="h-[120px] w-14 overflow-hidden"
      >
        {/* Top/bottom padding so items can center */}
        <div className="h-[44px]" />
        {items.map((item) => (
          <button
            key={item}
            ref={item === selected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              "flex w-full items-center justify-center h-8 text-sm transition-all duration-100",
              "focus-visible:outline-none",
              item === selected
                ? "text-primary font-bold scale-110"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
        <div className="h-[44px]" />
      </div>
    </div>
  );
}

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

function TimePicker({
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: TimePickerProps) {
  const displayTime =
    hour && minute ? `${hour}:${minute} ${period}` : "Pick a time";
  const hasValue = !!(hour && minute);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !hasValue && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-1">
          <WheelColumn items={hours} selected={hour} onSelect={onHourChange} />
          <span className="text-lg font-bold text-muted-foreground px-0.5 pb-0.5">:</span>
          <WheelColumn items={minutes} selected={minute} onSelect={onMinuteChange} />
          <div className="flex flex-col gap-1 ml-2">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { TimePicker };
