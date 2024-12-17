"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthContext";

export function Providers({ children }) {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
} 