// Email Service for Zynthr
// Mock provider by default; SendGrid when SENDGRID_API_KEY is set

import sgMail from '@sendgrid/mail';
if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import {
  welcomeEmail,
  baaConfirmationEmail,
  teamInviteEmail,
  onboardingDay3Email,
  onboardingDay7Email,
} from './email-templates';

interface SendEmailOptions {
  from?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string; type: string }>;
}

const DEFAULT_FROM = 'millie@zynthr.ai';

function useSendGrid(): boolean {
  return typeof process !== 'undefined' && !!process.env?.SENDGRID_API_KEY;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: SendEmailOptions
): Promise<{ success: boolean }> {
  const from = options?.from ?? DEFAULT_FROM;

  if (useSendGrid()) {
    const msg: Record<string, unknown> = { to, from, subject, html };
    if (options?.replyTo) msg.replyTo = options.replyTo;
    if (options?.attachments) msg.attachments = options.attachments;
    await sgMail.send(msg as unknown as Parameters<typeof sgMail.send>[0]);
    console.log(`[Email] SendGrid: sent "${subject}" to ${to}`);
    return { success: true };
  }

  // Mock provider — log only
  console.log(`[Email][Mock] To: ${to} | From: ${from} | Subject: ${subject}`);
  console.log(`[Email][Mock] HTML length: ${html.length} chars`);
  return { success: true };
}

export async function sendWelcomeEmail(user: {
  email: string;
  firstName: string;
  subdomain: string;
}): Promise<{ success: boolean }> {
  const { subject, html } = welcomeEmail({
    firstName: user.firstName,
    subdomain: user.subdomain,
  });
  return sendEmail(user.email, subject, html);
}

export async function sendBAAConfirmation(
  user: { email: string; firstName: string; subdomain: string },
  baaDetails: {
    signerName: string;
    signedDate: string;
    method: string;
    orgName: string;
  }
): Promise<{ success: boolean }> {
  const { subject, html } = baaConfirmationEmail({
    firstName: user.firstName,
    signerName: baaDetails.signerName,
    signedDate: baaDetails.signedDate,
    method: baaDetails.method,
    orgName: baaDetails.orgName,
    subdomain: user.subdomain,
  });
  return sendEmail(user.email, subject, html);
}

export async function sendTeamInvite(
  inviter: { name: string },
  invitee: { email: string; name: string },
  org: { name: string; department: string; role: string; inviteUrl: string }
): Promise<{ success: boolean }> {
  const { subject, html } = teamInviteEmail({
    inviterName: inviter.name,
    inviteeName: invitee.name,
    orgName: org.name,
    department: org.department,
    role: org.role,
    inviteUrl: org.inviteUrl,
  });
  return sendEmail(invitee.email, subject, html);
}

export async function scheduleOnboardingSequence(user: {
  email: string;
  firstName: string;
  subdomain: string;
}): Promise<void> {
  // TODO: Replace with real queue/cron (e.g., BullMQ, Inngest, or cron job)
  // For now, log the intent
  console.log(`[Email][Onboarding] Scheduled sequence for ${user.email}:`);
  console.log(`  - Day 3 email: ${new Date(Date.now() + 3 * 86400000).toISOString()}`);
  console.log(`  - Day 7 email: ${new Date(Date.now() + 7 * 86400000).toISOString()}`);

  // In development, send immediately for testing:
  if (process.env.NODE_ENV === 'development') {
    const day3 = onboardingDay3Email({ firstName: user.firstName, subdomain: user.subdomain });
    const day7 = onboardingDay7Email({ firstName: user.firstName, subdomain: user.subdomain });
    console.log(`[Email][Onboarding][Dev] Day 3 subject: "${day3.subject}"`);
    console.log(`[Email][Onboarding][Dev] Day 7 subject: "${day7.subject}"`);
  }
}
