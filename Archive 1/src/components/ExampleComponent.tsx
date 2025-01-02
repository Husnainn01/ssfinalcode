'use client';

import * as Sentry from "@sentry/nextjs";

export default function ExampleComponent() {
  try {
    // Your component logic
  } catch (error) {
    Sentry.captureException(error);
  }

} 