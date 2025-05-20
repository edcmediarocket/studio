
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 50" // Adjusted viewBox for more space
      width={168} // Adjusted width to maintain aspect ratio if height is around 30
      height={30} // Default height
      {...props}
      className={cn("text-primary", props.className)} // Ensure primary color is applied
    >
      <path
        d="M20.55,25.22c0-5.52,4.48-10,10-10s10,4.48,10,10c0,4.42-2.87,8.15-6.84,9.44l6.84,12.33h-7.66l-6.84-12.33V25.22z M20.55,15.22v27.5h-7.66V15.22H20.55z M0,42.72h7.66V15.22H0V42.72z"
        strokeWidth="2" // Made the M bolder
        stroke="hsl(var(--primary))"
        fill="none"
      />
      <text
        x="55" // Shifted text to the right
        y="35" // Adjusted y for better vertical centering
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--primary))"
        letterSpacing="1"
      >
        Rocket Meme
      </text>
    </svg>
  );
}
