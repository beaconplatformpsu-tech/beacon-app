import { Toaster as Sonner } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      richColors={true}
      closeButton
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
      }}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast relative overflow-hidden pointer-events-auto flex w-full items-start gap-3 rounded-lg border shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]",
          title: "text-sm font-semibold leading-tight",
          description: "text-xs mt-0.5 opacity-90",
          actionButton: "bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs",
          cancelButton: "bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs",
          closeButton: "absolute top-2 right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 text-current/50 hover:text-current",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
