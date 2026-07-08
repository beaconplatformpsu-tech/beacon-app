"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AppProgressBar } from "next-nprogress-bar";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{children}</LanguageProvider>
      <AppProgressBar
        height="3px"
        color="#38bdf8"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </QueryClientProvider>
  );
}
