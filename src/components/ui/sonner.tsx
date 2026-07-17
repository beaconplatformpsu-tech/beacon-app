"use client";

import { Toaster as Sonner } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { dir } = useLanguage();

  return (
    <Sonner
      dir={dir}
      position={dir === "rtl" ? "top-left" : "top-right"}
      richColors={true}
      closeButton
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-6 w-6" />,
        error: <XCircle className="h-6 w-6" />,
        info: <Info className="h-6 w-6" />,
        warning: <AlertTriangle className="h-6 w-6" />,
      }}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast relative overflow-hidden pointer-events-auto flex w-full items-center gap-4 rounded-xl px-5 py-4 shadow-xl border-0",
          success: "!bg-emerald-600 !text-white [--toast-progress-color:rgba(255,255,255,0.4)]",
          error: "!bg-red-500 !text-white [--toast-progress-color:rgba(255,255,255,0.4)]",
          info: "!bg-sky-500 !text-white [--toast-progress-color:rgba(255,255,255,0.4)]",
          warning: "!bg-amber-500 !text-white [--toast-progress-color:rgba(255,255,255,0.4)]",
          title: "text-[15px] font-medium",
          description: "text-sm opacity-90",
          icon: "text-white [&>svg]:w-6 [&>svg]:h-6 shrink-0 me-3",
          actionButton: "bg-white text-primary rounded-md px-2 py-1 text-xs font-semibold",
          cancelButton: "bg-white/20 text-white rounded-md px-2 py-1 text-xs",
          closeButton: "!absolute !top-1/2 !-translate-y-1/2 !right-2 rtl:!right-auto rtl:!left-2 !bg-transparent opacity-60 hover:opacity-100 transition-opacity !text-white !border-0 [&>svg]:w-4 [&>svg]:h-4 !w-8 !h-8 !flex !items-center !justify-center cursor-pointer",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
