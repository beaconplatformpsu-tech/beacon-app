import * as React from "react";
import { toast } from "sonner";

export function useCustomToast() {
  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      className: "![--toast-progress-color:theme(colors.emerald.500)]",
    });
  };

  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      className: "![--toast-progress-color:theme(colors.red.500)]",
    });
  };

  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      className: "![--toast-progress-color:theme(colors.sky.500)]",
    });
  };

  const warning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      className: "![--toast-progress-color:theme(colors.amber.500)]",
    });
  };

  return { success, error, info, warning };
}
