import type { IEmailService } from "../adapter.ts";
import type { GeneratedAccount, InboxMessage } from "../../../types/index.ts";
import type { Config } from "../../../types/index.ts";
import { buildRegisterUrl, buildInboxUrl } from "../../../config/index.ts";
import { generateAlias } from "../../../utils/names.ts";

function generatePassword(length = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

const OTP_PATTERNS: RegExp[] = [
  /\b(\d{6})\b/,
  /\botp[:\s]+(\d{4,8})\b/i,
  /\bkode[:\s]+(\d{4,8})\b/i,
  /\bcode[:\s]+(\d{4,8})\b/i,
  /\bverification[:\s]+(\d{4,8})\b/i,
  /\b(\d{4,8})\b/,
];

export class CustomEmailService implements IEmailService {
  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private get baseHeaders(): Record<string, string> {
    const h: Record<string, string> = { Accept: "application/json" };
    if (this.config.emailApiKey) {
      h["Authorization"] = `Bearer ${this.config.emailApiKey}`;
    }
    return h;
  }

  async generateAccount(): Promise<GeneratedAccount> {
    const alias = generateAlias();
    const password = generatePassword();
    const domainId = this.randomDomainId();

    const url = buildRegisterUrl(this.config);

    const response = await fetch(url, {
      method: "POST",
      headers: { ...this.baseHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        domain_id: domainId,
        username: alias,
        password,
        is_custom: false,
        ...(this.config.emailForwardTo
          ? { forward_to: this.config.emailForwardTo }
          : {}),
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `generateAccount gagal [${response.status}]: ${response.statusText} — ${text}`,
      );
    }

    const json = (await response.json()) as Record<string, unknown>;

    const inner = (json["data"] as Record<string, unknown> | undefined) ?? json;
    const email = String(inner["address"] ?? inner["email"] ?? "");

    if (!email) {
      throw new Error(
        `Response tidak mengandung alamat email. Body: ${JSON.stringify(json)}`,
      );
    }

    const sessionToken = String(
      inner["session_token"] ?? inner["token"] ?? null,
    );

    return { email, password, sessionToken };
  }

  async getInbox(
    sessionToken: string,
    _email: string,
  ): Promise<InboxMessage[]> {
    const url = buildInboxUrl(this.config, sessionToken);

    const response = await fetch(url, {
      method: "GET",
      headers: this.baseHeaders,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `getInbox gagal [${response.status}]: ${response.statusText} — ${text}`,
      );
    }

    const json = (await response.json()) as Record<string, unknown>;
    const messages: InboxMessage[] = [];
    const items = Array.isArray(json["data"]) ? json["data"] : [];

    for (const item of items) {
      const msg = item as Record<string, unknown>;
      messages.push({
        id: String(msg["id"] ?? ""),
        message_id: String(msg["message_id"] ?? ""),
        sender: String(msg["sender"] ?? ""),
        sender_name: String(msg["sender_name"] ?? ""),
        subject: String(msg["subject"] ?? ""),
        body_text: String(msg["body_text"] ?? ""),
        body_html: String(msg["body_html"] ?? ""),
        is_read: Boolean(msg["is_read"] ?? false),
        received_at: new Date(String(msg["received_at"] ?? "")),
      });
    }

    return messages;
  }

  extractOTP(messages: InboxMessage[]): string | null {
    const sorted = messages.sort(
      (a, b) => b.received_at.getTime() - a.received_at.getTime(),
    );

    for (const msg of sorted) {
      const text = msg.body_text || msg.body_html || "";
      for (const pattern of OTP_PATTERNS) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    return null;
  }

  private randomDomainId(): number {
    const ids = this.config.emailDomainIds;
    return ids.length === 0 ? 4 : ids[Math.floor(Math.random() * ids.length)]!;
  }
}
