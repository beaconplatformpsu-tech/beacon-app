import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, AlertTriangle, Info } from "lucide-react"

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) onClose()
    }}>
      <AlertDialogContent className="sm:max-w-[425px] overflow-hidden rounded-3xl border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl p-0">
        <div className={`h-2 w-full ${variant === 'destructive' ? 'bg-red-500' : 'bg-primary'}`} />
        <div className="p-6">
          <AlertDialogHeader>
            <div className="flex flex-col items-center gap-4 mb-2 text-center">
              <div className={`p-3 rounded-full ${variant === 'destructive' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                {variant === 'destructive' ? <AlertTriangle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
              </div>
              <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex sm:justify-center gap-3">
            <AlertDialogCancel disabled={isLoading} className="rounded-xl flex-1 sm:flex-none sm:w-32">{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
              }}
              disabled={isLoading}
              className={`rounded-xl flex-1 sm:flex-none sm:w-32 shadow-md ${variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"}`}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
