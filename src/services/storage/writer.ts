import { appendFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { TestResult, Config } from "../../types/index.ts";

function formatDate(date: Date): string {
  return date.toISOString().replace("T", " ").substring(0, 19);
}

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export class StorageWriter {
  private readonly filePath: string;
  private readonly format: Config["outputFormat"];
  private isFirstEntry = true;

  constructor(config: Config) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .substring(0, 19);
    const ext = config.outputFormat;
    this.filePath = join(
      process.cwd(),
      `${config.outputFile}-${timestamp}.${ext}`,
    );
    this.format = config.outputFormat;
    mkdirSync(dirname(this.filePath), { recursive: true });
    this.initFile();
  }

  private initFile(): void {
    switch (this.format) {
      case "csv":
        writeFileSync(
          this.filePath,
          "no,email,password,status,fail_reason,started_at,finished_at,duration_ms\n",
          "utf-8",
        );
        break;
      case "txt":
        writeFileSync(
          this.filePath,
          `Automation Create Account & OTP For GPT Account\nDimulai: ${new Date().toISOString()}\n${"=".repeat(60)}\n\n`,
          "utf-8",
        );
        break;
      case "json":
        writeFileSync(this.filePath, "[\n", "utf-8");
        break;
    }
  }

  write(result: TestResult): void {
    switch (this.format) {
      case "csv":
        this.writeCSV(result);
        break;
      case "txt":
        this.writeTXT(result);
        break;
      case "json":
        this.writeJSON(result);
        break;
    }
  }

  finalize(): void {
    if (this.format === "json") {
      appendFileSync(this.filePath, "\n]\n", "utf-8");
    }
  }

  getFilePath(): string {
    return this.filePath;
  }

  private writeCSV(result: TestResult): void {
    const row = [
      result.index,
      result.email,
      result.emailPassword,
      result.status,
      result.failReason ?? "",
      formatDate(result.startedAt),
      formatDate(result.finishedAt),
      result.durationMs,
    ]
      .map((v) => escapeCsvField(String(v)))
      .join(",");

    appendFileSync(this.filePath, row + "\n", "utf-8");
  }

  private writeTXT(result: TestResult): void {
    const lines = [
      `[#${result.index}] ${result.status.toUpperCase()}`,
      `  Email     : ${result.email || "-"}`,
      `  Password  : ${result.emailPassword || "-"}`,
      `  Mulai     : ${formatDate(result.startedAt)}`,
      `  Selesai   : ${formatDate(result.finishedAt)}`,
      `  Durasi    : ${result.durationMs}ms`,
      ...(result.failReason ? [`  Keterangan: ${result.failReason}`] : []),
      "",
    ].join("\n");

    appendFileSync(this.filePath, lines, "utf-8");
  }

  private writeJSON(result: TestResult): void {
    const comma = this.isFirstEntry ? "" : ",\n";
    this.isFirstEntry = false;

    const entry = JSON.stringify(
      {
        index: result.index,
        email: result.email,
        password: result.emailPassword,
        status: result.status,
        failReason: result.failReason ?? null,
        startedAt: result.startedAt.toISOString(),
        finishedAt: result.finishedAt.toISOString(),
        durationMs: result.durationMs,
      },
      null,
      2,
    );

    appendFileSync(this.filePath, comma + entry, "utf-8");
  }
}
