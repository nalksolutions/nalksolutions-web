import { expect, test } from '../local-test';
import { spawn } from 'node:child_process';

test('next start refuses production fixture mode before listening', async () => {
  const child = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3101'],
    {
      env: { ...process.env, APP_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let output = '';
  child.stdout.on('data', (data: Buffer) => {
    output += data.toString();
  });
  child.stderr.on('data', (data: Buffer) => {
    output += data.toString();
  });
  const timeout = setTimeout(() => child.kill(), 15_000);
  try {
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', resolve);
    });
    expect(code).not.toBe(0);
    expect(output).toContain('Production is disabled');
  } finally {
    clearTimeout(timeout);
    if (child.exitCode === null) child.kill();
  }
});
