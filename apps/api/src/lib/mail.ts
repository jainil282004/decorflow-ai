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
 * - In development/test without a key, logs the message so reset links remain usable locally.
 * - In production without a key, fails loudly (do not silently "send" by logging).
 */
export async function sendMail(input: SendMailInput): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.MAIL_FROM;

  if (!apiKey) {
    if (env.NODE_ENV === 'production') {
      logger.error('RESEND_API_KEY is required in production — refusing to log mail content');
      throw new Error('Email is not configured');
    }

    logger.warn('Mail not configured (RESEND_API_KEY missing) — logging email instead (dev only)', {
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
