'use client';

import * as Sentry from "@sentry/nextjs";
import { PropsWithChildren } from "react";

export function SentryErrorBoundary({ children }: PropsWithChildren) {
  return (
    <Sentry.ErrorBoundary
      fallback={({error}) => (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload page
          </button>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
} 