import { chromium, type Browser, type BrowserContext } from "patchright";
import type { Config } from "../../types/index.ts";
import { logger } from "../../utils/logger.ts";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
] as const;

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]!;
}

const STEALTH_SCRIPT = `
  (() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    try { delete navigator.__proto__.webdriver; } catch (_) {}

    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

    const _plugins = [
      { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format', version: '' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '', version: '' },
      { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: '', version: '' },
    ];
    Object.defineProperty(navigator, 'plugins', {
      get: () => Object.assign(_plugins, {
        item: (i) => _plugins[i] ?? null,
        namedItem: (n) => _plugins.find(p => p.name === n) ?? null,
        refresh: () => {},
        length: _plugins.length,
        [Symbol.iterator]: function*() { yield* _plugins; },
      }),
    });
    Object.defineProperty(navigator, 'mimeTypes', {
      get: () => Object.assign([], { item: () => null, namedItem: () => null, length: 0 }),
    });

    if (!window.chrome) {
      window.chrome = {
        app: { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } },
        runtime: {
          OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
          OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
          PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
          PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
          RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' },
        },
        loadTimes: () => ({
          requestTime: performance.now() / 1000,
          startLoadTime: performance.now() / 1000,
          commitLoadTime: performance.now() / 1000,
          finishDocumentLoadTime: performance.now() / 1000,
          finishLoadTime: performance.now() / 1000,
          firstPaintTime: 0,
          firstPaintAfterLoadTime: 0,
          navigationType: 'Other',
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true,
          npnNegotiatedProtocol: 'h2',
          wasAlternateProtocolAvailable: false,
          connectionInfo: 'h2',
        }),
        csi: () => ({
          startE: Date.now(),
          onloadT: Date.now(),
          pageT: performance.now(),
          tran: 15,
        }),
      };
    }

    const _origQuery = window.navigator.permissions?.query?.bind(window.navigator.permissions);
    if (_origQuery) {
      Object.defineProperty(window.navigator.permissions, 'query', {
        value: (p) => p.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission, onchange: null })
          : _origQuery(p),
      });
    }

    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

    Object.defineProperty(navigator, 'connection', {
      get: () => ({ rtt: 50, downlink: 10, effectiveType: '4g', saveData: false }),
    });

    const _getParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (p) {
      if (p === 37445) return 'Intel Inc.';               // UNMASKED_VENDOR_WEBGL
      if (p === 37446) return 'Intel(R) Iris(R) Xe Graphics'; // UNMASKED_RENDERER_WEBGL
      return _getParam.call(this, p);
    };
    const _getParam2 = WebGL2RenderingContext?.prototype?.getParameter;
    if (_getParam2) {
      WebGL2RenderingContext.prototype.getParameter = function (p) {
        if (p === 37445) return 'Intel Inc.';
        if (p === 37446) return 'Intel(R) Iris(R) Xe Graphics';
        return _getParam2.call(this, p);
      };
    }

    const _automationProps = [
      '__playwright', '__pw_manual', '__pw_hooks', '__pw_handle',
      '__webdriver_evaluate', '__selenium_unwrapped', '__fxdriver_evaluate',
      '__driver_evaluate', '__webdriver_script_func', '__webdriver_script_fn',
      '__webdriverFunc', '_phantom', 'callPhantom', '__nightmare',
    ];
    for (const prop of _automationProps) {
      try { delete window[prop]; } catch (_) {}
      try { Object.defineProperty(window, prop, { get: () => undefined, configurable: true }); } catch (_) {}
    }

    Object.defineProperty(screen, 'width',      { get: () => 1280 });
    Object.defineProperty(screen, 'height',     { get: () => 720 });
    Object.defineProperty(screen, 'availWidth', { get: () => 1280 });
    Object.defineProperty(screen, 'availHeight',{ get: () => 720 });
    Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
    Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
  })();
`;

function buildLaunchArgs(): string[] {
  return [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-infobars",
    "--window-size=1280,720",

    "--disable-extensions",
    "--disable-default-apps",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-notifications",
    "--disable-component-extensions-with-background-pages",

    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-ipc-flooding-protection",
    "--disable-sync",
    "--metrics-recording-only",
    "--password-store=basic",
    "--use-mock-keychain",
    "--safebrowsing-disable-auto-update",

    "--lang=en-US",
    "--accept-lang=en-US,en;q=0.9",
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
      logger.dim(`Browser: patchright auto-detect (TLS-patched Chromium)`);
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
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
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
