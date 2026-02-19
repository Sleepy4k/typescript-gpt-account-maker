import * as clack from "@clack/prompts";
import pc from "picocolors";
import type { LoopSummary, TestResult } from "../types/index.ts";

export function displayProgress(
  current: number,
  total: number,
  result: TestResult,
): void {
  const icon = result.status === "success" ? pc.green("✓") : pc.red("✗");
  const status =
    result.status === "success" ? pc.green("PASS") : pc.red("FAIL");
  const bar = buildProgressBar(current, total, 24);
  const label = result.email || pc.dim("(no email)");
  const ms = pc.dim(`${result.durationMs}ms`);

  console.log(
    `  ${icon} ${bar} ${pc.dim(`${current}/${total}`)} ${status} — ${label} ${ms}`,
  );
}

export function displaySummary(summary: LoopSummary): void {
  console.log("");
  clack.log.info(pc.bold("Hasil Testing"));

  const passRate = Math.round((summary.success / summary.total) * 100);
  const rateColor =
    passRate === 100 ? pc.green : passRate >= 80 ? pc.yellow : pc.red;

  const rows = [
    `  Total   : ${pc.bold(String(summary.total))}`,
    `  ${pc.green("Berhasil")}: ${pc.green(pc.bold(String(summary.success)))}`,
    `  ${pc.red("Gagal   ")}: ${pc.red(pc.bold(String(summary.failed)))}`,
    `  Pass Rate: ${rateColor(pc.bold(`${passRate}%`))}`,
    `  Output  : ${pc.cyan(summary.outputFile)}`,
  ];

  rows.forEach((row) => console.log(row));

  if (summary.failed > 0) {
    console.log("");
    clack.log.warn("Detail kegagalan:");
    summary.results
      .filter((r) => r.status === "failed")
      .forEach((r) => {
        console.log(
          `  ${pc.red(`#${r.index}`)} — ${r.failReason ?? "Unknown error"}`,
        );
      });
  }
}

function buildProgressBar(
  current: number,
  total: number,
  width: number,
): string {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return pc.green("█".repeat(filled)) + pc.dim("░".repeat(empty));
}
