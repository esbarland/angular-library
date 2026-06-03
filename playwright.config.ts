import { defineConfig, devices } from '@playwright/test';
import * as os from 'os';
import * as path from 'path';

const PW_LIBS = path.join(os.homedir(), '.local', 'playwright-libs');
const ldLibraryPath = process.env['LD_LIBRARY_PATH']
  ? `${PW_LIBS}:${process.env['LD_LIBRARY_PATH']}`
  : PW_LIBS;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      env: {
        ...(process.env as Record<string, string>),
        LD_LIBRARY_PATH: ldLibraryPath,
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
