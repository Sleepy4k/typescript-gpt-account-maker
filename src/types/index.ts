export interface GeneratedAccount {
  email: string;
  password: string;
  sessionToken: string;
}

export interface InboxMessage {
  id: string;
  message_id: string;
  sender: string;
  sender_name: string;
  subject: string;
  body_text: string;
  body_html: string;
  is_read: boolean;
  received_at: Date;
}

export interface TestResult {
  index: number;
  email: string;
  emailPassword: string;
  status: "success" | "failed";
  failReason?: string;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
}

export interface Config {
  targetUrl: string;
  emailApiBaseUrl: string;
  emailRegisterPath: string;
  emailInboxPath: string;
  emailApiKey?: string;
  emailDomainIds: number[];
  emailForwardTo: string;

  headless: boolean;
  browserSlowMo: number;
  browserChannel: string;
  browserExecutablePath: string;
  browserLaunchTimeoutMs: number;

  otpBatch1Retries: number;
  otpBatch2Retries: number;
  otpPollIntervalMs: number;
  outputFile: string;
  outputFormat: "csv" | "txt" | "json";
}

export interface LoopSummary {
  total: number;
  success: number;
  failed: number;
  results: TestResult[];
  outputFile: string;
}
