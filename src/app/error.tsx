"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-destructive/10 via-background to-background" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg border border-destructive/20 bg-card p-10 rounded-3xl shadow-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
          <AlertOctagon className="h-10 w-10 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight">System Exception</h1>
        
        <p className="mt-4 text-muted-foreground text-sm">
          A critical error occurred while rendering this page. Our engineering team has been notified (in spirit).
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
          <Button onClick={() => reset()} className="flex-1 rounded-full gap-2 bg-destructive hover:bg-destructive/90 text-white">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
