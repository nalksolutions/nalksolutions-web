export const PUBLIC_ORIGIN = 'https://nalksolutions.com';
export const PUBLIC_PATH_HEADER = 'x-nalk-public-path';

export function assertFixtureEnvironment(
  env: Readonly<Record<string, string | undefined>> = process.env,
): 'local' | 'test' {
  const mode = env.APP_ENV ?? 'local';
  if (mode !== 'local' && mode !== 'test') {
    throw new Error(
      'Fixture content requires APP_ENV=local or APP_ENV=test. Production is disabled.',
    );
  }
  return mode;
}
