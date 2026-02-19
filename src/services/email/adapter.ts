import type { GeneratedAccount, InboxMessage } from "../../types/index.ts";

export interface IEmailService {
  generateAccount(): Promise<GeneratedAccount>;
  getInbox(sessionToken: string, email: string): Promise<InboxMessage[]>;
  extractOTP(messages: InboxMessage[]): string | null;
}
