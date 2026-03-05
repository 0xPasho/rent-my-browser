import { Resend } from "resend";
import { env } from "../env.js";

export interface EmailSender {
  sendMagicLink(email: string, url: string): Promise<void>;
  sendOtp(email: string, code: string): Promise<void>;
}

class ConsoleEmailSender implements EmailSender {
  async sendMagicLink(email: string, url: string): Promise<void> {
    console.log(`[EMAIL] Magic link for ${email}: ${url}`);
  }
  async sendOtp(email: string, code: string): Promise<void> {
    console.log(`[EMAIL] OTP for ${email}: ${code}`);
  }
}

class ResendEmailSender implements EmailSender {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async sendMagicLink(email: string, url: string): Promise<void> {
    await this.client.emails.send({
      from: env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Your login link — Rent My Browser",
      text: `Here's your magic link to sign in:\n\n${url}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    });
  }

  async sendOtp(email: string, code: string): Promise<void> {
    await this.client.emails.send({
      from: env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Your verification code — Rent My Browser",
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    });
  }
}

export const emailSender: EmailSender = env.RESEND_API_KEY
  ? new ResendEmailSender(env.RESEND_API_KEY)
  : new ConsoleEmailSender();
