import { ServerClient } from "postmark";
import { env } from "../env.js";

export interface EmailSender {
  sendMagicLink(email: string, url: string): Promise<void>;
}

class ConsoleEmailSender implements EmailSender {
  async sendMagicLink(email: string, url: string): Promise<void> {
    console.log(`[EMAIL] Magic link for ${email}: ${url}`);
  }
}

class PostmarkEmailSender implements EmailSender {
  private client: ServerClient;

  constructor(apiToken: string) {
    this.client = new ServerClient(apiToken);
  }

  async sendMagicLink(email: string, url: string): Promise<void> {
    await this.client.sendEmail({
      From: env.POSTMARK_FROM_EMAIL!,
      To: email,
      Subject: "Your login link — Rent My Browser",
      TextBody: `Here's your magic link to sign in:\n\n${url}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    });
  }
}

export const emailSender: EmailSender = env.POSTMARK_API_TOKEN
  ? new PostmarkEmailSender(env.POSTMARK_API_TOKEN)
  : new ConsoleEmailSender();
