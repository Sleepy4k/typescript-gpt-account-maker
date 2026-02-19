import { chromium, type Browser, type BrowserContext } from "playwright";
import type { Config } from "../../types/index.ts";
import { logger } from "../../utils/logger.ts";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/123.0.0.0",
] as const;

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]!;
}

const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  Object.defineProperty(navigator, 'plugins', {
    get: () => {
      const arr = [1, 2, 3, 4, 5];
      Object.defineProperty(arr, 'item',      { get: () => () => null });
      Object.defineProperty(arr, 'namedItem', { get: () => () => null });
      return arr;
    }
  });
  if (!window.chrome) {
    window.chrome = { runtime: {}, loadTimes: () => ({}), csi: () => ({}) };
  }
  const _origQuery = window.navigator.permissions?.query;
  if (_origQuery) {
    window.navigator.permissions.query = (p) =>
      p.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission, onchange: null })
        : _origQuery(p);
  }
`;

function buildLaunchArgs(): string[] {
  return [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-infobars",
    "--window-size=1280,720",
  ];
}

export class BrowserAutomation {
  private browser: Browser | null = null;
  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async launch(): Promise<void> {
    const launchOptions: Parameters<typeof chromium.launch>[0] = {
      headless: this.config.headless,
      slowMo: this.config.browserSlowMo,
      timeout: this.config.browserLaunchTimeoutMs,
      args: buildLaunchArgs(),
    };

    if (this.config.browserExecutablePath) {
      launchOptions.executablePath = this.config.browserExecutablePath;
      logger.dim(`Browser: custom path → ${this.config.browserExecutablePath}`);
    } else if (this.config.browserChannel) {
      launchOptions.channel = this.config.browserChannel;
      logger.dim(`Browser: channel "${this.config.browserChannel}" (sistem)`);
    } else {
      logger.dim(`Browser: Playwright auto-detect (ms-playwright)`);
    }

    this.browser = await chromium.launch(launchOptions);
  }

  async newContext(): Promise<BrowserContext> {
    if (!this.browser) throw new Error("Browser belum di-launch");

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: randomUA(),
      locale: "en-US",
      timezoneId: "America/New_York",
      permissions: ["geolocation"],
    });

    await context.addInitScript(STEALTH_SCRIPT);

    return context;
  }

  async close(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
  }

  isRunning(): boolean {
    return this.browser !== null;
  }
}
