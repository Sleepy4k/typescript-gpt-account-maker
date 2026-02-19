import type { Config, TestResult } from "../types/index.ts";
import type { IEmailService } from "../services/email/adapter.ts";
import type { BrowserAutomation } from "../services/browser/automation.ts";
import * as steps from "../services/browser/steps/register.ts";
import { delay } from "../utils/delay.ts";
import { logger } from "../utils/logger.ts";

export async function runSingleTest(
  index: number,
  emailService: IEmailService,
  browser: BrowserAutomation,
  config: Config,
): Promise<TestResult> {
  const startedAt = new Date();

  try {
    logger.step(`[${index}] Membuat akun email...`);
    const account = await emailService.generateAccount();
    logger.dim(`Email     : ${account.email}`);
    logger.dim(`Password  : ${account.password}`);

    logger.step(`[${index}] Membuka browser context...`);
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      logger.step(`[${index}] Membuka halaman & klik login...`);
      await steps.navigateToRegisterPage(page);

      logger.step(`[${index}] Mengisi email & password...`);
      await steps.fillRegistrationForm(page, account.email, account.password);

      await steps.submitRegistrationForm(page);

      logger.step(`[${index}] Menunggu kolom OTP muncul...`);
      await steps.waitForOTPInput(page);

      const batch1Msg = `${config.otpBatch1Retries} percobaan × ${config.otpPollIntervalMs / 1000}s`;
      logger.step(`[${index}] Polling OTP batch-1 (${batch1Msg})...`);

      let otp = await pollForOTP(
        emailService,
        account.sessionToken,
        account.email,
        config.otpBatch1Retries,
        config.otpPollIntervalMs,
      );

      if (!otp) {
        logger.warn(
          `[${index}] OTP tidak masuk dalam batch-1, mencoba Resend Email...`,
        );
        try {
          await steps.clickResendEmail(page);
        } catch {
          logger.dim(
            "Tombol Resend tidak ditemukan, lanjut polling batch-2...",
          );
        }

        const batch2Msg = `${config.otpBatch2Retries} percobaan × ${config.otpPollIntervalMs / 1000}s`;
        logger.step(`[${index}] Polling OTP batch-2 (${batch2Msg})...`);

        otp = await pollForOTP(
          emailService,
          account.sessionToken,
          account.email,
          config.otpBatch2Retries,
          config.otpPollIntervalMs,
        );
      }

      if (!otp) {
        throw new Error(
          `OTP tidak diterima setelah ${config.otpBatch1Retries + config.otpBatch2Retries} percobaan`,
        );
      }

      logger.dim(`OTP       : ${otp}`);

      logger.step(`[${index}] Memasukkan OTP...`);
      await steps.enterOTPCode(page, otp);
      await steps.submitOTPForm(page);

      logger.step(`[${index}] Mengisi personal info & menunggu redirect...`);
      await steps.verifyRegistrationSuccess(page);
    } finally {
      await context.close();
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    logger.success(`[${index}] Test BERHASIL (${durationMs}ms)`);

    return {
      index,
      email: account.email,
      emailPassword: account.password,
      status: "success",
      startedAt,
      finishedAt,
      durationMs,
    };
  } catch (err) {
    const finishedAt = new Date();
    const failReason = err instanceof Error ? err.message : String(err);
    logger.error(`[${index}] Test GAGAL — ${failReason}`);

    return {
      index,
      email: "",
      emailPassword: "",
      status: "failed",
      failReason,
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
    };
  }
}

async function pollForOTP(
  emailService: IEmailService,
  sessionToken: string,
  email: string,
  maxRetries: number,
  intervalMs: number,
): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    if (i % 2 === 0) {
      logger.dim(`Menunggu email masuk... (${(i * intervalMs) / 1000}s)`);
    }
    try {
      const inbox = await emailService.getInbox(sessionToken, email);
      const otp = emailService.extractOTP(inbox);
      if (otp) return otp;
    } catch (err) {
      logger.step(
        `Gagal ambil inbox, coba lagi... Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    await delay(intervalMs);
  }
  return null;
}
