
"use client";

import Image from 'next/image';

export function AnimatedGalaxyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(hsl(var(--primary))_0.5px,transparent_0.5px)] [background-size:30px_30px] animate-pulse opacity-30"></div>

      {/* Shooting Stars */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-shooting-star-1 w-1 h-1 bg-foreground rounded-full absolute top-1/4 left-1/4 opacity-80"></div>
        <div className="animate-shooting-star-2 w-0.5 h-0.5 bg-foreground rounded-full absolute top-1/2 left-1/3 opacity-70"></div>
        <div className="animate-shooting-star-3 w-1 h-1 bg-foreground rounded-full absolute top-1/3 left-2/3 opacity-90"></div>
        <div className="animate-shooting-star-4 w-0.5 h-0.5 bg-foreground rounded-full absolute top-3/4 left-1/2 opacity-60"></div>
        <div className="animate-shooting-star-5 w-1 h-1 bg-foreground rounded-full absolute top-1/4 left-3/4 opacity-80"></div>
      </div>

      {/* Rocket Blasting Off */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Rocket_Emoji_3D_Icon.svg/512px-Rocket_Emoji_3D_Icon.svg.png"
          alt="Rocket Blasting Off"
          width={96}
          height={96}
          className="animate-blastoff"
          priority
          unoptimized // Using unoptimized for external SVG to avoid potential Next/Image processing issues
          data-ai-hint="rocket space"
        />
      </div>
    </div>
  );
}
