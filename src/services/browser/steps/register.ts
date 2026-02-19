import type { Page } from "playwright";
import { generateFullName } from "../../../utils/names.ts";
import { logger } from "../../../utils/logger.ts";

export async function navigateToRegisterPage(page: Page): Promise<void> {
  const url = process.env["TARGET_URL"] ?? "";

  logger.dim(`Navigasi ke: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(3_000);

  const loginSelector = 'button[data-testid="login-button"]';
  try {
    await page.waitForSelector(loginSelector, {
      state: "visible",
      timeout: 10_000,
    });
    await page.locator(loginSelector).first().click();
    logger.dim("Tombol login diklik (data-testid)");
    return;
  } catch {
    logger.dim("Selector data-testid tidak ditemukan, mencoba fallback...");
  }

  try {
    await page
      .locator("button")
      .filter({ hasText: /log\s*in/i })
      .first()
      .click({ timeout: 5_000 });
    logger.dim("Tombol login diklik (teks fallback)");
  } catch (ex) {
    logger.warn(`Tombol login tidak ditemukan: ${ex}`);
    await page
      .screenshot({ path: "results/debug_login_fail.png" })
      .catch(() => {});
  }
}

export async function fillRegistrationForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const emailSelector =
    'input#email-input, input[name="email"], input[type="email"]';

  await page.waitForSelector(emailSelector, {
    state: "visible",
    timeout: 999_999,
  });
  await page.fill(emailSelector, email);
  await page.keyboard.press("Enter");
  logger.dim("Email diisi, Enter ditekan");

  await page.waitForTimeout(3_000);

  await page.waitForSelector('input[type="password"]', {
    state: "visible",
    timeout: 30_000,
  });
  await page.fill('input[type="password"]', password);
  await page.keyboard.press("Enter");
  logger.dim("Password diisi, Enter ditekan");
}

export async function submitRegistrationForm(page: Page): Promise<void> {
  await page.waitForTimeout(1_000);
}

export async function waitForOTPInput(page: Page): Promise<void> {
  await page.waitForSelector(
    'input[autocomplete="one-time-code"], input[aria-label="Digit 1"]',
    { state: "visible", timeout: 30_000 },
  );
}

export async function clickResendEmail(page: Page): Promise<void> {
  const btn = page
    .locator("button, a, div")
    .filter({ hasText: /resend\s*email/i })
    .first();

  const visible = await btn.isVisible({ timeout: 3_000 }).catch(() => false);
  if (!visible) throw new Error("Tombol Resend Email tidak ditemukan");

  await btn.click();
  logger.dim("Resend Email diklik");
}

export async function enterOTPCode(page: Page, otp: string): Promise<void> {
  try {
    await page.waitForSelector(
      'input[autocomplete="one-time-code"], input[aria-label="Digit 1"]',
      { state: "visible", timeout: 10_000 },
    );

    if (await page.isVisible('input[aria-label="Digit 1"]')) {
      for (let i = 0; i < otp.length; i++) {
        await page.type(`input[aria-label="Digit ${i + 1}"]`, otp[i]!, {
          delay: 100,
        });
      }
      logger.dim("OTP diisi per-digit");
    } else {
      await page.fill('input[autocomplete="one-time-code"]', otp);
      logger.dim("OTP diisi satu field");
    }
  } catch {
    logger.dim("Fallback: OTP diketik via keyboard");
    await page.keyboard.type(otp);
  }
}

export async function submitOTPForm(page: Page): Promise<void> {
  try {
    const continueBtn = page.locator('button[data-dd-action-name="Continue"]');
    if (await continueBtn.isVisible({ timeout: 5_000 })) {
      await continueBtn.click();
      return;
    }

    await page
      .locator('button[type="submit"]')
      .filter({ hasText: /continue/i })
      .click({ timeout: 2_000 });
  } catch {
    logger.dim("Tombol Continue tidak ditemukan, kemungkinan auto-submit");
  }
}

export async function verifyRegistrationSuccess(page: Page): Promise<void> {
  try {
    await page.waitForSelector(
      'input[name="name"], input[data-testid="profile-name-input"]',
      { state: "visible", timeout: 30_000 },
    );

    const displayName = generateFullName();
    await page.fill(
      'input[name="name"], input[data-testid="profile-name-input"]',
      displayName,
    );
    logger.dim(`Nama diisi: ${displayName}`);

    if (await page.isVisible('input[placeholder="MM"]')) {
      await page.fill('input[placeholder="MM"]', "11");
      await page.fill('input[placeholder="DD"]', "15");
      await page.fill('input[placeholder="YYYY"]', "2001");
    } else {
      await page.keyboard.press("Tab");
      await page.keyboard.type("11152001", { delay: 100 });
    }

    await page.keyboard.press("Enter");
  } catch {
    logger.dim("Form personal info tidak ditemukan, lanjut...");
  }

  try {
    const submitBtn = page
      .locator('button[type="submit"], button')
      .filter({ hasText: /continue|next|submit/i })
      .first();

    if (await submitBtn.isVisible({ timeout: 3_000 })) {
      await submitBtn.click();
    }
  } catch {
    /* tidak ada tombol — lanjut */
  }

  try {
    await page.waitForURL(
      (url) => url.href.includes("chat") && !url.href.includes("auth"),
      { timeout: 60_000 },
    );
    logger.dim(`Redirect sukses: ${page.url()}`);
  } catch {
    const currentUrl = page.url();
    if (currentUrl.includes("challenge")) {
      await page
        .screenshot({ path: "results/debug_challenge.png" })
        .catch(() => {});
      throw new Error(
        "Terdeteksi Captcha/Challenge! Set HEADLESS=false untuk selesaikan manual.",
      );
    }
    throw new Error(
      `Timeout menunggu redirect sukses. URL saat ini: ${currentUrl}`,
    );
  }
}
