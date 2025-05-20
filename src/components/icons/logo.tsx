
import Image from 'next/image';
import type { ImageProps } from 'next/image';

// Direct link to the Google Drive image
const LOGO_URL = "https://drive.google.com/uc?export=view&id=1RDhrBi0rnEFUEfrUAgMVL4jGqdiKKRmn"; 
// Default dimensions, adjust if your logo's aspect ratio is significantly different
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
      data-ai-hint="app logo" 
      {...props}
      className={props.className} // Ensure className prop is passed through
    />
  );
}
