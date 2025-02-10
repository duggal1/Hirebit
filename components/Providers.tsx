// components/Providers.tsx
"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextAuthProvider } from "@/components/general/NextAuthProvider";
import { ThemeProvider } from "@/components/general/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

// Create a QueryClient instance (do not pass the class itself)
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster closeButton richColors />
        </ThemeProvider>
      </NextAuthProvider>
    </QueryClientProvider>
  );
}
