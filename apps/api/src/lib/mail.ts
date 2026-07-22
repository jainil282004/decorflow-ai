import { env } from '../config/env';
import { logger } from '@decorflow/logger';

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Lightweight mail sender with no extra npm dependencies.
 * - If RESEND_API_KEY is set, sends via Resend's HTTPS API.
 * - Otherwise logs the message (dev/local fallback) so reset links are still usable.
 */
export async function sendMail(input: SendMailInput): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.MAIL_FROM;

  if (!apiKey) {
    logger.warn('Mail not configured (RESEND_API_KEY missing) — logging email instead', {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<pre>${input.text}</pre>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error('Failed to send email via Resend', { status: response.status, body });
    throw new Error('Failed to send email');
  }
}
