// Safe uuid helper: try to use `uuid` (which depends on crypto.getRandomValues).
// If it's not available or fails, provide a simple fallback id generator.
export function makeId(): string {
  try {
    // Use require to avoid bundler-time errors if uuid not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const uuid = require('uuid');
    if (uuid && typeof uuid.v4 === 'function') {
      return uuid.v4();
    }
  } catch (err) {
    // ignore and use fallback
  }

  // Fallback: timestamp + random string (not cryptographically secure)
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
