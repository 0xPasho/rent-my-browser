export interface EmailSender {
  sendMagicLink(email: string, url: string): Promise<void>;
}

class ConsoleEmailSender implements EmailSender {
  async sendMagicLink(email: string, url: string): Promise<void> {
    console.log(`[EMAIL] Magic link for ${email}: ${url}`);
  }
}

// TODO: swap for Resend/SendGrid when ready
export const emailSender: EmailSender = new ConsoleEmailSender();
