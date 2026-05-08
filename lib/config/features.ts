function readEnvironmentVariable(name: string) {
  const processLike = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return processLike.process?.env?.[name]?.trim() ?? "";
}

export function arePaymentsEnabled() {
  return readEnvironmentVariable("PAYMENTS_ENABLED").toLowerCase() === "true";
}

