import type { Config, LoopSummary, TestResult } from "../types/index.ts";
import type { IEmailService } from "../services/email/adapter.ts";
import { BrowserAutomation } from "../services/browser/automation.ts";
import { StorageWriter } from "../services/storage/writer.ts";
import { runSingleTest } from "./runner.ts";
import { logger } from "../utils/logger.ts";

export type ProgressCallback = (
  current: number,
  total: number,
  result: TestResult,
) => void;

export async function runTestLoop(
  totalTests: number,
  emailService: IEmailService,
  config: Config,
  onProgress?: ProgressCallback,
): Promise<LoopSummary> {
  const browser = new BrowserAutomation(config);
  const writer = new StorageWriter(config);
  const results: TestResult[] = [];

  await browser.launch();
  logger.info(`Browser aktif (headless: ${config.headless})`);

  try {
    for (let i = 1; i <= totalTests; i++) {
      const result = await runSingleTest(i, emailService, browser, config);
      results.push(result);
      writer.write(result);
      onProgress?.(i, totalTests, result);
      console.log("");
    }
  } finally {
    await browser.close();
    writer.finalize();
    logger.dim("Browser ditutup.");
  }

  const success = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return {
    total: totalTests,
    success,
    failed,
    results,
    outputFile: writer.getFilePath(),
  };
}
