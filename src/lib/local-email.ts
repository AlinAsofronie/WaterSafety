// Mock email service for local development (replaces AWS SES)

export interface EmailParams {
  to: string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  from?: string;
}

class LocalEmailService {
  private sentEmails: Array<EmailParams & { sentAt: string }> = [];

  async sendEmail(params: EmailParams): Promise<boolean> {
    console.log('\n========== LOCAL EMAIL SERVICE ==========');
    console.log('From:', params.from || 'noreply@localhost');
    console.log('To:', params.to.join(', '));
    console.log('Subject:', params.subject);
    console.log('---');
    if (params.textBody) {
      console.log('Text Body:');
      console.log(params.textBody);
    }
    if (params.htmlBody) {
      console.log('\nHTML Body:');
      console.log(params.htmlBody.substring(0, 500) + '...');
    }
    console.log('=========================================\n');

    // Store email in memory for retrieval
    this.sentEmails.push({
      ...params,
      sentAt: new Date().toISOString(),
    });

    return true;
  }

  getSentEmails(): Array<EmailParams & { sentAt: string }> {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

export const localEmailService = new LocalEmailService();

// Mock SES send email function
export async function sendLocalEmail(params: {
  Source: string;
  Destination: { ToAddresses: string[] };
  Message: {
    Subject: { Data: string };
    Body: {
      Html?: { Data: string };
      Text?: { Data: string };
    };
  };
}): Promise<void> {
  await localEmailService.sendEmail({
    from: params.Source,
    to: params.Destination.ToAddresses,
    subject: params.Message.Subject.Data,
    htmlBody: params.Message.Body.Html?.Data,
    textBody: params.Message.Body.Text?.Data,
  });
}
