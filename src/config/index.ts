import type { Config } from "../types/index.ts";

function expandWindowsEnvVars(value: string): string {
  return value.replace(/%([^%]+)%/g, (_, varName: string) => {
    return (
      process.env[varName] ??
      process.env[varName.toUpperCase()] ??
      `%${varName}%`
    );
  });
}

export function loadConfig(): Config {
  return {
    targetUrl: process.env["TARGET_URL"] ?? "",

    emailApiBaseUrl: (process.env["EMAIL_API_BASE_URL"] ?? "").replace(
      /\/$/,
      "",
    ),
    emailRegisterPath: process.env["EMAIL_REGISTER_PATH"] ?? "/generate",
    emailInboxPath: process.env["EMAIL_INBOX_PATH"] ?? "/inbox?address={token}",
    emailApiKey: process.env["EMAIL_API_KEY"],
    emailDomainIds: (process.env["EMAIL_DOMAIN_IDS"] ?? "4,5,7,8,9")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n)),
    emailForwardTo: process.env["EMAIL_FORWARD_TO"] ?? "",

    headless: process.env["HEADLESS"] !== "false",
    browserSlowMo: parseInt(process.env["BROWSER_SLOW_MO"] ?? "0"),
    browserChannel: process.env["BROWSER_CHANNEL"] ?? "",
    browserExecutablePath: expandWindowsEnvVars(
      process.env["BROWSER_EXECUTABLE_PATH"] ?? "",
    ),
    browserLaunchTimeoutMs: parseInt(
      process.env["BROWSER_LAUNCH_TIMEOUT_MS"] ?? "30000",
    ),

    otpBatch1Retries: parseInt(process.env["OTP_BATCH1_RETRIES"] ?? "6"),
    otpBatch2Retries: parseInt(process.env["OTP_BATCH2_RETRIES"] ?? "12"),
    otpPollIntervalMs: parseInt(process.env["OTP_POLL_INTERVAL_MS"] ?? "5000"),

    outputFile: process.env["OUTPUT_FILE"] ?? "results/results",
    outputFormat:
      (process.env["OUTPUT_FORMAT"] as Config["outputFormat"]) ?? "csv",
  };
}

export function validateConfig(config: Config): string[] {
  const errors: string[] = [];
  if (!config.targetUrl) errors.push("TARGET_URL wajib diisi");
  if (!config.emailApiBaseUrl) errors.push("EMAIL_API_BASE_URL wajib diisi");
  if (!config.emailRegisterPath.startsWith("/"))
    errors.push("EMAIL_REGISTER_PATH harus diawali '/' (contoh: /generate)");
  if (!config.emailInboxPath.includes("{token}"))
    errors.push(
      "EMAIL_INBOX_PATH harus mengandung placeholder {token} (contoh: /inbox?address={token})",
    );
  return errors;
}

export function buildRegisterUrl(config: Config): string {
  return config.emailApiBaseUrl + config.emailRegisterPath;
}

export function buildInboxUrl(config: Config, token: string): string {
  return (
    config.emailApiBaseUrl +
    config.emailInboxPath.replace("{token}", encodeURIComponent(token))
  );
}
