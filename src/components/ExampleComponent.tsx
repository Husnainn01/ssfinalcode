'use client';

import * as Sentry from "@sentry/nextjs";

export default function ExampleComponent() {
  try {
    // Your component logic
  } catch (error) {
    Sentry.captureException(error);
    // Handle error gracefully
  }

  // For custom events/monitoring
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: 'User performed an action',
    level: 'info',
  });

  return (
    // Your component JSX
  );
} 