
import Image from 'next/image';
import type { ImageProps } from 'next/image';

// Note: Replace the placeholder 'src' below with the actual URL of your hosted logo image.
const LOGO_URL = "https://placehold.co/120x32.png?text=Rocket+Meme+Logo"; 
// Example dimensions, adjust as needed for your logo's aspect ratio and desired header size.
const LOGO_WIDTH = 120;
const LOGO_HEIGHT = 32;

export function Logo(props: Partial<Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>>) {
  return (
    <Image
      src={LOGO_URL}
      alt="Rocket Meme Logo"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority // Good to add for LCP elements like a logo in the header
      data-ai-hint="app logo" // Add your AI hint here
      {...props}
      className={props.className} // Ensure className prop is passed through
    />
  );
}
