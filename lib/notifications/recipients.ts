function readEnvironmentVariable(name: string) {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return globalWithProcess.process?.env?.[name]?.trim() ?? "";
}

export function getAdminNotificationEmail() {
  return (
    readEnvironmentVariable("NOTIFICATION_ADMIN_EMAIL") ||
    readEnvironmentVariable("ADMIN_NOTIFICATION_EMAIL") ||
    readEnvironmentVariable("ADMIN_EMAIL")
  );
}
