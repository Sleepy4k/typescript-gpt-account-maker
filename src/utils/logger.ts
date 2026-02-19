import pc from "picocolors";

function timestamp(): string {
  return pc.dim(new Date().toTimeString().substring(0, 8));
}

export const logger = {
  info: (msg: string) => console.log(`${timestamp()} ${pc.blue("ℹ")} ${msg}`),
  success: (msg: string) =>
    console.log(`${timestamp()} ${pc.green("✓")} ${pc.green(msg)}`),
  error: (msg: string) =>
    console.log(`${timestamp()} ${pc.red("✗")} ${pc.red(msg)}`),
  warn: (msg: string) =>
    console.log(`${timestamp()} ${pc.yellow("⚠")} ${pc.yellow(msg)}`),
  step: (msg: string) => console.log(`${timestamp()} ${pc.cyan("→")} ${msg}`),
  dim: (msg: string) => console.log(`         ${pc.dim(msg)}`),
};
