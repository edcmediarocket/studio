
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 50"
      width="168"
      height="30"
      aria-label="Rocket Meme Logo"
      {...props}
    >
      {/* Rocket-like M shape */}
      <path
        d="M10 40 Q 15 10 20 40 L 25 15 L 30 40 Q 35 10 40 40"
        stroke="hsl(var(--primary))" // Use direct primary color for stroke
        strokeWidth="4"
        fill="none"
      />
      <text
        x="55"
        y="35"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary))" // Use direct primary color for fill
      >
        Rocket Meme
      </text>
    </svg>
  );
}
