// Email Templates for Zynthr Client Onboarding
// Table-based layouts with inline styles for Gmail, Outlook, and Apple Mail compatibility

interface EmailOutput {
  subject: string;
  html: string;
}

const BRAND = {
  headerBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  headerBgFallback: '#1a1a2e',
  ctaBg: '#2563eb',
  ctaHover: '#1d4ed8',
  footerText: '#9ca3af',
  bodyBg: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  borderColor: '#e5e7eb',
};

function wrapLayout(body: string, ctaText: string, ctaUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<!-- Header -->
<tr><td style="background:${BRAND.headerBgFallback};background-image:${BRAND.headerBg};padding:32px 40px;text-align:center;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="text-align:center;">
<span style="font-size:28px;font-weight:800;letter-spacing:6px;color:#ffffff;text-transform:uppercase;">ZYNTHR</span>
</td></tr></table>
</td></tr>
<!-- Body -->
<tr><td style="background-color:${BRAND.bodyBg};padding:40px;">
${body}
<!-- CTA -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
<tr><td align="center">
<a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:${BRAND.ctaBg};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:8px;">${ctaText}</a>
</td></tr></table>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid ${BRAND.borderColor};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;color:${BRAND.footerText};font-size:12px;line-height:1.6;">
&copy; 2026 Zynthr Inc. | Jacksonville, FL | Powered by Zynthr. Run by Millie.<br/>
<a href="{{unsubscribe_url}}" style="color:${BRAND.footerText};text-decoration:underline;">Unsubscribe</a>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};">${text}</p>`;
}

function pMuted(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.textSecondary};">${text}</p>`;
}

export function welcomeEmail(params: {
  firstName: string;
  subdomain: string;
}): EmailOutput {
  const { firstName, subdomain } = params;
  const workspaceUrl = `https://${subdomain}.zynthr.ai`;

  const body = `
${p(`Hey ${firstName},`)}
${p(`Welcome to Zynthr! I'm Millie, and I'll be running your operations from here on out.`)}
${p(`Your workspace is ready at <a href="${workspaceUrl}" style="color:${BRAND.ctaBg};font-weight:600;text-decoration:none;">${subdomain}.zynthr.ai</a>.`)}
${p(`Here's what to do next:`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
<tr><td style="padding:6px 0;font-size:15px;color:${BRAND.textPrimary};"><strong>1.</strong>&nbsp; Complete your org setup</td></tr>
<tr><td style="padding:6px 0;font-size:15px;color:${BRAND.textPrimary};"><strong>2.</strong>&nbsp; Deploy your first agent</td></tr>
<tr><td style="padding:6px 0;font-size:15px;color:${BRAND.textPrimary};"><strong>3.</strong>&nbsp; Invite your team</td></tr>
</table>
${p(`If you need anything, just ask me — I'm literally always here.`)}
${p(`— Millie`)}`;

  return {
    subject: "Welcome to Zynthr — Millie's ready when you are 🚀",
    html: wrapLayout(body, 'Go to Your Workspace', workspaceUrl),
  };
}

export function baaConfirmationEmail(params: {
  firstName: string;
  signerName: string;
  signedDate: string;
  method: string;
  orgName: string;
  subdomain: string;
}): EmailOutput {
  const { firstName, signerName, signedDate, method, orgName, subdomain } = params;

  const body = `
${p(`Hey ${firstName},`)}
${p(`This confirms that the Business Associate Agreement (BAA) between <strong>${orgName}</strong> and Zynthr Inc. has been successfully signed.`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f9fafb;border:1px solid ${BRAND.borderColor};border-radius:8px;width:100%;">
<tr><td style="padding:16px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:4px 0;font-size:14px;color:${BRAND.textSecondary};">Signer</td><td style="padding:4px 0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;text-align:right;">${signerName}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;color:${BRAND.textSecondary};">Date</td><td style="padding:4px 0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;text-align:right;">${signedDate}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;color:${BRAND.textSecondary};">Method</td><td style="padding:4px 0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;text-align:right;">${method}</td></tr>
</table>
</td></tr></table>
${p(`A PDF copy of the signed BAA is attached to this email for your records.`)}
${p(`<strong>Your organization is now HIPAA-compliant on Zynthr.</strong>`)}
${pMuted(`If you have questions about your compliance status or need additional documentation, visit your security settings.`)}`;

  return {
    subject: 'Your BAA with Zynthr has been signed ✅',
    html: wrapLayout(body, 'View Your Security Settings', `https://${subdomain}.zynthr.ai/settings/security`),
  };
}

export function teamInviteEmail(params: {
  inviterName: string;
  inviteeName: string;
  orgName: string;
  department: string;
  role: string;
  inviteUrl: string;
}): EmailOutput {
  const { inviterName, inviteeName, orgName, department, role, inviteUrl } = params;

  const body = `
${p(`Hey ${inviteeName},`)}
${p(`<strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Zynthr.`)}
${p(`You'll be joining the <strong>${department}</strong> department as a <strong>${role}</strong>.`)}
${pMuted(`Zynthr is an AI-powered operations platform. Once you accept, you'll have access to your team's workspace, agents, and tools.`)}`;

  return {
    subject: `${orgName} invited you to Zynthr`,
    html: wrapLayout(body, 'Accept Invitation', inviteUrl),
  };
}

export function onboardingDay3Email(params: {
  firstName: string;
  subdomain: string;
}): EmailOutput {
  const { firstName, subdomain } = params;

  const body = `
${p(`Hey ${firstName},`)}
${p(`It's been a few days since you set up. Just checking in — have you deployed your first agent yet?`)}
${p(`If not, here's a 2-minute guide. If you're stuck, talk to me in the chat. I don't bite. Well, I can't bite. I'm an AI. 😄`)}
${pMuted(`Most teams deploy their first agent within the first 48 hours. You're right on track.`)}
${p(`— Millie`)}`;

  return {
    subject: 'Quick check-in from Millie 👋',
    html: wrapLayout(body, 'Deploy Your First Agent', `https://${subdomain}.zynthr.ai/agents/new`),
  };
}

export function onboardingDay7Email(params: {
  firstName: string;
  subdomain: string;
  agentsDeployed?: number;
  messagesSent?: number;
  reportsGenerated?: number;
}): EmailOutput {
  const { firstName, subdomain, agentsDeployed = 0, messagesSent = 0, reportsGenerated = 0 } = params;

  const statCell = (label: string, value: number) =>
    `<td style="text-align:center;padding:16px;">
<div style="font-size:28px;font-weight:800;color:${BRAND.ctaBg};">${value}</div>
<div style="font-size:12px;color:${BRAND.textSecondary};margin-top:4px;">${label}</div>
</td>`;

  const body = `
${p(`Hey ${firstName},`)}
${p(`Your first week with Zynthr — let's see how it went:`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f9fafb;border:1px solid ${BRAND.borderColor};border-radius:8px;">
<tr>
${statCell('Agents Deployed', agentsDeployed)}
${statCell('Messages Sent', messagesSent)}
${statCell('Reports Generated', reportsGenerated)}
</tr></table>
${p(`Not bad for week one! Here's what most teams do next:`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
<tr><td style="padding:6px 0;font-size:15px;color:${BRAND.textPrimary};">✦&nbsp; Invite more team members</td></tr>
<tr><td style="padding:6px 0;font-size:15px;color:${BRAND.textPrimary};">✦&nbsp; Set up Guardian Gates for training</td></tr>
<tr><td style="padding:6px 0;font-size:15px;color:${BRAND.textPrimary};">✦&nbsp; Connect additional systems</td></tr>
</table>`;

  return {
    subject: "Your first week with Zynthr — how'd it go?",
    html: wrapLayout(body, 'Explore Advanced Features', `https://${subdomain}.zynthr.ai/features`),
  };
}

// === Agent Fleet Shared Utilities ===

export const ZYNTHR_HEADER = `
<div style="background:linear-gradient(135deg,#003146,#559CB5);padding:24px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:white;margin:0;font-size:22px">Zynthr</h1>
</div>`

export const ZYNTHR_FOOTER = `
<div style="padding:16px;text-align:center;color:#999;font-size:12px">
  <p>Zynthr Inc. · AI-Powered Operations · <a href="https://app.zynthr.ai" style="color:#559CB5">app.zynthr.ai</a></p>
  <p><a href="https://app.zynthr.ai/unsubscribe" style="color:#999">Unsubscribe</a></p>
</div>`

export function wrapEmail(body: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto">${ZYNTHR_HEADER}<div style="background:#f8fafc;padding:24px;border:1px solid #e5e7eb;border-top:none">${body}</div>${ZYNTHR_FOOTER}</div>`
}

export const AGENT_SIGNATURES: Record<string, string> = {
  scout: '— Scout, Zynthr Sales',
  sage: '— Sage, Your Zynthr Success Guide',
  milo: '— Milo, Zynthr Support',
  echo: '— Echo, Zynthr Marketing',
  hunter: '— Hunter, Zynthr Outbound',
  closer: '— Closer, Zynthr Demo Prep',
  cashflow: '— Cashflow, Zynthr Billing',
  coach: '— Coach, Zynthr Training',
  bridge: '— Bridge, Zynthr Partnerships',
}
