import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8 shadow-glow">
          <Compass className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-8xl font-display font-bold tracking-tight text-foreground/90">404</h1>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Lost in the Algorithm</h2>
        
        <p className="mt-4 text-muted-foreground">
          The page you are looking for has been moved, deleted, or never existed in the first place. 
          Let&apos;s get you back on track.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button asChild size="lg" className="rounded-full shadow-glow">
            <Link href="/">
              Return Home <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/support">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
