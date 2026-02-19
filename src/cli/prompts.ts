import * as clack from "@clack/prompts";
import pc from "picocolors";
import { loadConfig, validateConfig } from "../config/index.ts";
import type { Config } from "../types/index.ts";

export interface CLIInput {
  totalTests: number;
  headless: boolean;
  outputFormat: Config["outputFormat"];
}

export async function runCLIPrompts(): Promise<CLIInput | null> {
  console.clear();
  clack.intro(
    pc.bgBlue(pc.white(pc.bold("  Automation Create Account & OTP For GPT Account  "))),
  );

  const config = loadConfig();
  const errors = validateConfig(config);

  if (errors.length > 0) {
    clack.log.error("Konfigurasi tidak lengkap:");
    errors.forEach((e) => clack.log.warn(`  • ${e}`));
    clack.log.info(
      "Salin file .env.example ke .env lalu isi dengan nilai yang benar.",
    );
    clack.outro(pc.red("Setup diperlukan sebelum menjalankan testing."));
    return null;
  }

  clack.log.info(`Target URL : ${pc.cyan(config.targetUrl)}`);
  clack.log.info(`Email API  : ${pc.cyan(config.emailApiBaseUrl)}`);
  console.log("");

  const totalTestsRaw = await clack.text({
    message: "Berapa banyak test yang akan dijalankan?",
    placeholder: "1",
    validate(value) {
      const n = parseInt(value ?? "", 10);
      if (isNaN(n) || n < 1) return "Masukkan angka minimal 1";
      if (n > 500) return "Maksimal 500 test per sesi";
    },
  });
  if (clack.isCancel(totalTestsRaw)) {
    clack.cancel("Dibatalkan.");
    process.exit(0);
  }

  const headlessRaw = await clack.confirm({
    message: "Jalankan browser tanpa tampilan (headless mode)?",
    initialValue: true,
  });
  if (clack.isCancel(headlessRaw)) {
    clack.cancel("Dibatalkan.");
    process.exit(0);
  }

  const outputFormatRaw = await clack.select({
    message: "Format file output?",
    options: [
      {
        value: "csv" as Config["outputFormat"],
        label: "CSV",
        hint: "Mudah dibuka di Excel / Google Sheets (rekomendasi)",
      },
      {
        value: "txt" as Config["outputFormat"],
        label: "TXT",
        hint: "Plain text, mudah dibaca langsung",
      },
      {
        value: "json" as Config["outputFormat"],
        label: "JSON",
        hint: "Untuk integrasi programatik",
      },
    ],
  });
  if (clack.isCancel(outputFormatRaw)) {
    clack.cancel("Dibatalkan.");
    process.exit(0);
  }

  return {
    totalTests: parseInt(totalTestsRaw as string, 10),
    headless: headlessRaw as boolean,
    outputFormat: outputFormatRaw as Config["outputFormat"],
  };
}
