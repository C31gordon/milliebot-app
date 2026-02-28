import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import {
  welcomeEmail,
  baaConfirmationEmail,
  teamInviteEmail,
  onboardingDay3Email,
  onboardingDay7Email,
} from '@/lib/email-templates';

interface RequestBody {
  template: string;
  to: string;
  data: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { template, to, data } = body;

    if (!template || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: template, to' },
        { status: 400 }
      );
    }

    let subject: string;
    let html: string;

    if (template === 'welcome') {
      const result = welcomeEmail({
        firstName: data.firstName ?? 'there',
        subdomain: data.subdomain ?? 'app',
      });
      subject = result.subject;
      html = result.html;
    } else if (template === 'baa_confirmation') {
      const result = baaConfirmationEmail({
        firstName: data.firstName ?? 'there',
        signerName: data.signerName ?? '',
        signedDate: data.signedDate ?? new Date().toLocaleDateString(),
        method: data.method ?? 'Digital',
        orgName: data.orgName ?? '',
        subdomain: data.subdomain ?? 'app',
      });
      subject = result.subject;
      html = result.html;
    } else if (template === 'team_invite') {
      const result = teamInviteEmail({
        inviterName: data.inviterName ?? '',
        inviteeName: data.inviteeName ?? 'there',
        orgName: data.orgName ?? '',
        department: data.department ?? '',
        role: data.role ?? 'Member',
        inviteUrl: data.inviteUrl ?? '#',
      });
      subject = result.subject;
      html = result.html;
    } else if (template === 'day3') {
      const result = onboardingDay3Email({
        firstName: data.firstName ?? 'there',
        subdomain: data.subdomain ?? 'app',
      });
      subject = result.subject;
      html = result.html;
    } else if (template === 'day7') {
      const result = onboardingDay7Email({
        firstName: data.firstName ?? 'there',
        subdomain: data.subdomain ?? 'app',
        agentsDeployed: data.agentsDeployed ? parseInt(data.agentsDeployed) : 0,
        messagesSent: data.messagesSent ? parseInt(data.messagesSent) : 0,
        reportsGenerated: data.reportsGenerated ? parseInt(data.reportsGenerated) : 0,
      });
      subject = result.subject;
      html = result.html;
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    await sendEmail(to, subject, html);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API][Email] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
