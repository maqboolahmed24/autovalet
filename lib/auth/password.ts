export class PasswordAuthNotConfiguredError extends Error {
  constructor() {
    super("Password hashing is not configured yet.");
    this.name = "PasswordAuthNotConfiguredError";
  }
}

export async function hashPassword(_password: string): Promise<string> {
  // TODO: Install and configure argon2 or bcrypt before enabling admin login.
  throw new PasswordAuthNotConfiguredError();
}

export async function verifyPassword(_password: string, _passwordHash: string): Promise<boolean> {
  // TODO: Verify passwords with the same modern hashing algorithm used by hashPassword.
  throw new PasswordAuthNotConfiguredError();
}
