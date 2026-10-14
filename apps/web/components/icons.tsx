import { Fish, Package, Shell, Shrimp } from "lucide-react";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...props }: IconProps) {
  return { width: size, height: size, viewBox: "0 0 24 24", ...props };
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.37 9.37 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.71C5.79.71.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" aria-hidden="true">
      <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 0 1-5.2 1.7 2.9 2.9 0 0 1 3.2-4.5V9.1a6.3 6.3 0 0 0-5.4 10.7 6.3 6.3 0 0 0 10.8-4.4V8.6a8.2 8.2 0 0 0 4.8 1.5V6.7h-1z" />
    </svg>
  );
}

export function CrabIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="14" rx="6" ry="4" />
      <path d="M9 10.5 7.5 7M15 10.5 16.5 7" />
      <path d="M7.5 7c-2 0-3.5-1.5-3.5-3.5 1 .8 2.4.8 3-.3M16.5 7c2 0 3.5-1.5 3.5-3.5-1 .8-2.4.8-3-.3" />
      <path d="M6.3 15.5 3 17M6.5 13 3 13M17.7 15.5 21 17M17.5 13 21 13M8 17.5l-2 3M16 17.5l2 3" />
      <circle cx="10.5" cy="12.5" r=".4" fill="currentColor" />
      <circle cx="13.5" cy="12.5" r=".4" fill="currentColor" />
    </svg>
  );
}

export function SquidIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2c-3 2.5-4.5 5.5-4.5 9h9C16.5 7.5 15 4.5 12 2Z" />
      <path d="M7.5 11h9" />
      <path d="M8.5 11c0 4-2.5 6-3.5 9M10.5 11c0 4-1 7-1.5 10M13.5 11c0 4 1 7 1.5 10M15.5 11c0 4 2.5 6 3.5 9" />
      <circle cx="10.3" cy="8.5" r=".5" fill="currentColor" />
      <circle cx="13.7" cy="8.5" r=".5" fill="currentColor" />
    </svg>
  );
}

export function CategoryIcon({ icon, ...props }: Omit<IconProps, "name"> & { icon: string | null }) {
  const { size = 24, className } = props;
  switch (icon) {
    case "shrimp":
      return <Shrimp size={size} className={className} />;
    case "crab":
      return <CrabIcon {...props} />;
    case "squid":
      return <SquidIcon {...props} />;
    case "shell":
      return <Shell size={size} className={className} />;
    case "package":
      return <Package size={size} className={className} />;
    default:
      return <Fish size={size} className={className} />;
  }
}
