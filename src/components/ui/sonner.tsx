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
            "group toast relative overflow-hidden pointer-events-auto flex w-full items-center gap-4 rounded-xl p-6 shadow-xl border-0 min-h-[85px] [&>[data-icon]]:me-4 [&>[data-content]]:me-10",
          success: "!bg-emerald-600 !text-white [--toast-progress-color:rgba(255,255,255,0.5)]",
          error: "!bg-red-500 !text-white [--toast-progress-color:rgba(255,255,255,0.5)]",
          info: "!bg-sky-500 !text-white [--toast-progress-color:rgba(255,255,255,0.5)]",
          warning: "!bg-amber-500 !text-white [--toast-progress-color:rgba(255,255,255,0.5)]",
          title: "text-base font-semibold [unicode-bidi:plaintext] text-start",
          description: "text-sm opacity-90 mt-1 [unicode-bidi:plaintext] text-start leading-relaxed",
          icon: "text-white [&>svg]:w-6 [&>svg]:h-6 shrink-0",
          actionButton: "bg-white text-primary rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-white/90 transition-colors",
          cancelButton: "bg-white/20 text-white rounded-md px-3 py-1.5 text-xs hover:bg-white/30 transition-colors",
          closeButton: "rtl:!left-3 rtl:!right-auto ltr:!right-3 ltr:!left-auto !absolute !top-1/2 !-translate-y-1/2 !bg-transparent opacity-60 hover:opacity-100 transition-opacity !text-white !border-0 [&>svg]:w-4 [&>svg]:h-4 !w-8 !h-8 !flex !items-center !justify-center cursor-pointer hover:bg-white/10 rounded-md",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
