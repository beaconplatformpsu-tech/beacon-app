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
        success: <CheckCircle2 className="h-6 w-6" />,
        error: <AlertTriangle className="h-6 w-6" />,
      }}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast relative overflow-hidden pointer-events-auto flex w-full items-center gap-3 rounded-md px-4 py-3 shadow-lg border-0 " +
            "after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-1.5 after:bg-white/30 after:[animation:toast-progress_4000ms_linear_forwards]",
          success: "!bg-emerald-600 !text-white",
          error: "!bg-red-500 !text-white",
          title: "text-[15px] font-medium",
          description: "text-sm opacity-90",
          icon: "text-white [&>svg]:w-6 [&>svg]:h-6 shrink-0",
          actionButton: "bg-white text-primary rounded-md px-2 py-1 text-xs font-semibold",
          cancelButton: "bg-white/20 text-white rounded-md px-2 py-1 text-xs",
          closeButton: "absolute top-1/2 -translate-y-1/2 end-2 !bg-transparent opacity-60 group-hover:opacity-100 transition-opacity !text-white !border-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
