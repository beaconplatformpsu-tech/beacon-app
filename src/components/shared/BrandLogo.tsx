import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/beacon-logo.jpg";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  textClass?: string;
  imageClass?: string;
  showText?: boolean;
}

export function BrandLogo({ className, textClass, imageClass, showText = true }: BrandLogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <Image 
        src={logo} 
        alt="Beacon" 
        priority
        className={cn("h-10 w-10 rounded-md object-cover ring-1 ring-border/20 shadow-sm", imageClass)} 
      />
      {showText && <span className={cn("font-sans font-bold text-2xl tracking-widest", textClass)}>Beacon</span>}
    </Link>
  );
}
