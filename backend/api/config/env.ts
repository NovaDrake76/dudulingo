/**
 * Environment variable validation
 * Ensures all required configuration is present before starting the server
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

export function validateEnvironment(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file against .env.example'
    );
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.\n' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  // Validate ALLOWED_ORIGINS in production
  if (process.env.IS_DEV !== 'true' && !process.env.ALLOWED_ORIGINS) {
    throw new Error(
      'ALLOWED_ORIGINS must be set in production to prevent CORS vulnerabilities'
    );
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
    console.warn(
      `Warning: NODE_ENV="${process.env.NODE_ENV}" is not standard. Expected: ${validEnvs.join(', ')}`
    );
  }
}
