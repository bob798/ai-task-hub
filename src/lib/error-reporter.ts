type ErrorContext = { userId?: string; action?: string; extra?: Record<string, unknown> };

export function reportError(error: unknown, context?: ErrorContext) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Log structured error (production: replace with Sentry/LogTail)
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    stack,
    ...context,
  }));
}
