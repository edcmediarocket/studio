
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 50" // Increased viewBox width
      width="168" // Adjusted width: 280 * (30/50)
      height="30"
      aria-label="Rocket Meme Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--neon-accent-hsl))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="280" height="50" fill="transparent" />
      {/* Simplified graphic for "Rocket Meme" - could be a stylized R or rocket shape */}
      <path d="M10 40 Q 15 10 20 40 L 25 15 L 30 40 Q 35 10 40 40" stroke="url(#logoGradient)" strokeWidth="3" fill="none" />
      <text
        x="55" // Adjusted text x-coordinate further right
        y="35"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary))" // Changed from --foreground to --primary
      >
        Rocket Meme
      </text>
    </svg>
  );
}
