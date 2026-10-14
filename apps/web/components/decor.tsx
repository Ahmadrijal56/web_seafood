import { cn } from "@/lib/utils";

export function Wave({ className, fill = "#ffffff", flip }: { className?: string; fill?: string; flip?: boolean }) {
  return (
    <svg
      className={cn("pointer-events-none block w-full", flip && "rotate-180", className)}
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill={fill}
        d="M0 50c120 22 240 33 360 26C540 66 660 22 840 18c150-3 270 26 390 36 90 7 160 4 210-3V90H0z"
      />
    </svg>
  );
}

const BUBBLES = [
  { left: "6%", size: 10, delay: "0s", duration: "9s" },
  { left: "18%", size: 6, delay: "2s", duration: "11s" },
  { left: "32%", size: 14, delay: "4s", duration: "10s" },
  { left: "48%", size: 8, delay: "1s", duration: "12s" },
  { left: "63%", size: 12, delay: "3s", duration: "9s" },
  { left: "77%", size: 6, delay: "5s", duration: "13s" },
  { left: "90%", size: 10, delay: "2.5s", duration: "10s" },
];

export function Bubbles({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full border border-white/40 bg-white/10 animate-bubble"
          style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.duration }}
        />
      ))}
    </div>
  );
}
