const adminLoginRateLimitWindowMs = 15 * 60 * 1000;
const adminLoginRateLimitMaxFailures = 5;

type AdminLoginRateLimitRecord = {
  failures: number;
  resetsAt: number;
};

export type AdminLoginRateLimitStatus =
  | {
      limited: false;
    }
  | {
      limited: true;
      retryAfterSeconds: number;
    };

const failedLoginAttempts = new Map<string, AdminLoginRateLimitRecord>();

function normalizeEmail(value: string) {
  return value.trim().toLowerCase() || "unknown";
}

function readForwardedClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();

  return forwardedFor || realIp || cloudflareIp || "unknown";
}

export function getAdminLoginRateLimitKeys(request: Request, email: string) {
  const clientIp = readForwardedClientIp(request);

  return [
    `ip:${clientIp}`,
    `email:${normalizeEmail(email)}`,
  ];
}

function readActiveRecord(key: string, timestamp: number) {
  const record = failedLoginAttempts.get(key);

  if (!record) {
    return null;
  }

  if (record.resetsAt <= timestamp) {
    failedLoginAttempts.delete(key);
    return null;
  }

  return record;
}

export function checkAdminLoginRateLimit(keys: string[], timestamp = Date.now()): AdminLoginRateLimitStatus {
  let retryAfterSeconds = 0;

  for (const key of keys) {
    const record = readActiveRecord(key, timestamp);

    if (record && record.failures >= adminLoginRateLimitMaxFailures) {
      retryAfterSeconds = Math.max(retryAfterSeconds, Math.ceil((record.resetsAt - timestamp) / 1000));
    }
  }

  if (retryAfterSeconds > 0) {
    return {
      limited: true,
      retryAfterSeconds,
    };
  }

  return {
    limited: false,
  };
}

export function recordFailedAdminLogin(keys: string[], timestamp = Date.now()) {
  for (const key of keys) {
    const activeRecord = readActiveRecord(key, timestamp);

    if (!activeRecord) {
      failedLoginAttempts.set(key, {
        failures: 1,
        resetsAt: timestamp + adminLoginRateLimitWindowMs,
      });
      continue;
    }

    activeRecord.failures += 1;
  }
}

export function clearFailedAdminLogin(keys: string[]) {
  for (const key of keys) {
    failedLoginAttempts.delete(key);
  }
}

export function resetAdminLoginRateLimitForTests() {
  failedLoginAttempts.clear();
}
