import * as clack from "@clack/prompts";
import pc from "picocolors";
import { loadConfig } from "./config/index.ts";
import { runCLIPrompts } from "./cli/prompts.ts";
import { displayProgress, displaySummary } from "./cli/display.ts";
import { CustomEmailService } from "./services/email/impl/custom.ts";
import { runTestLoop } from "./core/loop.ts";
import { logger } from "./utils/logger.ts";

async function main(): Promise<void> {
  const input = await runCLIPrompts();
  if (!input) process.exit(1);

  const config = loadConfig();
  config.headless = input.headless;
  config.outputFormat = input.outputFormat;

  const emailService = new CustomEmailService(config);

  console.log("");
  logger.info(
    `Memulai ${input.totalTests} test terhadap ${pc.cyan(config.targetUrl)}`,
  );
  console.log("");

  try {
    const summary = await runTestLoop(
      input.totalTests,
      emailService,
      config,
      (current, total, result) => displayProgress(current, total, result),
    );

    displaySummary(summary);
    clack.outro(`Selesai. Hasil disimpan di: ${pc.cyan(summary.outputFile)}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Fatal error: ${msg}`);
    clack.outro(pc.red("Test run gagal."));
    process.exit(1);
  }
}

main();
