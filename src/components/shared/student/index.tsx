"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

// ─── StudentPageContainer ─────────────────────────────────────────────────────
interface StudentPageContainerProps {
  children: ReactNode;
  className?: string;
}
export function StudentPageContainer({ children, className = "" }: StudentPageContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 ${className}`}>
      {children}
    </div>
  );
}

// ─── StudentPageHeader ────────────────────────────────────────────────────────
interface StudentPageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}
export function StudentPageHeader({ title, description, icon, actions }: StudentPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}
export function SectionCard({
  title,
  description,
  actions,
  children,
  footer,
  className = "",
  contentClassName = "",
}: SectionCardProps) {
  return (
    <Card className={`border-border/60 ${className}`}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="min-w-0">
            {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
            {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer && <div className="px-6 pb-5 pt-0 border-t border-border/40 mt-2">{footer}</div>}
    </Card>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}
export function StatCard({ label, value, icon, trend, trendValue, className = "" }: StatCardProps) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };
  return (
    <Card className={`border-border/60 ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {trendValue && trend && (
          <p className={`text-xs mt-1.5 ${trendColors[trend]}`}>{trendValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── LoadingState ─────────────────────────────────────────────────────────────
interface LoadingStateProps {
  message?: string;
  className?: string;
}
export function LoadingState({ message, className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-24 space-y-4 ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}
export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center py-20 bg-card border border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 ${className}`}>
      {icon && (
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/40">
          {icon}
        </div>
      )}
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`text-center py-20 bg-destructive/5 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive/60">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> {retryLabel}
        </Button>
      )}
    </div>
  );
}
