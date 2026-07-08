import { Toaster as Sonner } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      richColors={false}
      closeButton
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        error: <XCircle className="h-5 w-5 text-red-400" />,
        info: <Info className="h-5 w-5 text-sky-400" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      }}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast relative overflow-hidden pointer-events-auto flex w-full items-start gap-3 rounded-lg border-0 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] " +
            "bg-[#151520] text-slate-100",
          title: "text-sm font-semibold leading-tight",
          description: "text-xs text-slate-400 mt-0.5",
          actionButton: "bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs",
          cancelButton: "bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs",
          closeButton: "absolute top-2 right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-white/50 hover:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
