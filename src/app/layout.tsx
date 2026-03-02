import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Zynthr — AI Agent Platform for Property Management, Healthcare & Construction',
    template: '%s | Zynthr',
  },
  description: 'Deploy AI agents that automate leasing, patient intake, RFI tracking, and more. Multi-tenant platform with role-based access control (RKBAC™). Free to start.',
  keywords: [
    'AI agent platform', 'AI automation', 'AI agents for business',
    'property management AI', 'healthcare AI agents', 'construction AI',
    'multi-agent orchestration', 'RKBAC', 'role-based access control',
    'workflow automation', 'AI-powered operations', 'enterprise AI',
    'leasing automation', 'patient intake AI', 'RFI tracking AI',
    'AI agent builder', 'no-code AI agents', 'AI command center',
    'Zynthr', 'AI SaaS platform',
  ],
  authors: [{ name: 'Zynthr Inc.', url: 'https://zynthr.ai' }],
  creator: 'Zynthr Inc.',
  publisher: 'Zynthr Inc.',
  metadataBase: new URL('https://app.zynthr.ai'),
  alternates: {
    canonical: 'https://app.zynthr.ai',
  },
  openGraph: {
    title: 'Zynthr — AI Agents That Run Your Business',
    description: 'Deploy AI agents for property management, healthcare, and construction. RKBAC™ security. Multi-tenant. Free to start.',
    url: 'https://app.zynthr.ai',
    siteName: 'Zynthr',
    type: 'website',
    locale: 'en_US',
    images: [{
      url: 'https://app.zynthr.ai/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Zynthr AI Agent Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zynthr — AI Agents That Run Your Business',
    description: 'Deploy AI agents for property management, healthcare, and construction. Free to start.',
    creator: '@zynthr',
    images: ['https://app.zynthr.ai/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these once you verify:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-code',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='8' y='8' width='16' height='16' rx='2' transform='rotate(45 16 16)' fill='%23559CB5'/><circle cx='16' cy='16' r='4' fill='white'/></svg>" />
        <meta name="theme-color" content="#001825" />

        {/* JSON-LD Structured Data — SEO + GEO (AI engines cite structured sources) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Zynthr",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "AI agent platform that deploys intelligent agents for property management, healthcare, and construction. Features RKBAC™ (Role & Knowledge-Based Access Control), multi-tenant architecture, and workflow automation.",
          "url": "https://app.zynthr.ai",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "0",
            "highPrice": "299",
            "offerCount": "3",
            "offers": [
              { "@type": "Offer", "name": "Free", "price": "0", "description": "Integration walkthroughs, community guides, RKBAC access control" },
              { "@type": "Offer", "name": "Pro", "price": "49", "priceCurrency": "USD", "description": "Managed credentials, monitoring, advanced workflows" },
              { "@type": "Offer", "name": "Enterprise", "price": "299", "priceCurrency": "USD", "description": "Pre-built OAuth connectors, dedicated support, custom agents" }
            ]
          },
          "featureList": [
            "AI agent deployment and orchestration",
            "Role & Knowledge-Based Access Control (RKBAC™)",
            "Multi-tenant architecture",
            "Property management automation (leasing, work orders, DLRs)",
            "Healthcare automation (patient intake, scheduling, HIPAA compliance)",
            "Construction automation (RFI tracking, daily reports, safety compliance)",
            "Workflow builder with visual step editor",
            "Integration walkthroughs for Google Workspace, Microsoft 365, Slack, and more",
            "AI chat with model selection (Anthropic, OpenAI, open-source)",
            "Usage metering and cost optimization"
          ],
          "creator": {
            "@type": "Organization",
            "name": "Zynthr Inc.",
            "url": "https://zynthr.ai",
            "foundingDate": "2026",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Jacksonville",
              "addressRegion": "FL",
              "addressCountry": "US"
            },
            "sameAs": [
              "https://linkedin.com/company/zynthr",
              "https://twitter.com/zynthr",
              "https://youtube.com/@zynthr",
              "https://instagram.com/zynthr",
              "https://facebook.com/zynthr"
            ]
          }
        }) }} />

        {/* FAQ Schema — GEO loves Q&A format (AI engines pull from this) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is Zynthr?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zynthr is an AI agent platform that lets businesses deploy intelligent agents to automate operations. It serves property management, healthcare, and construction industries with features like RKBAC™ access control, multi-tenant architecture, and visual workflow builders."
              }
            },
            {
              "@type": "Question",
              "name": "What is RKBAC?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "RKBAC (Role & Knowledge-Based Access Control) is Zynthr's proprietary security framework that controls what each AI agent can see and do based on the user's role and department. It ensures agents only access data they're authorized to use."
              }
            },
            {
              "@type": "Question",
              "name": "How much does Zynthr cost?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zynthr offers a free tier with integration walkthroughs and RKBAC access control. Pro plans start at $49/month with managed credentials and monitoring. Enterprise plans at $299/month include pre-built OAuth connectors and dedicated support."
              }
            },
            {
              "@type": "Question",
              "name": "What industries does Zynthr support?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zynthr specializes in property management (leasing automation, work order routing, DLR generation), healthcare (patient intake, scheduling, HIPAA-compliant workflows), and construction (RFI tracking, daily field reports, safety compliance). The platform also supports technology, finance, and legal industries."
              }
            },
            {
              "@type": "Question",
              "name": "How is Zynthr different from other AI agent platforms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zynthr differentiates with three key features: 1) RKBAC™ — no other platform offers role-based AI access control at the agent level. 2) Multi-tenant from day one — each customer's data is completely isolated. 3) Industry-specific onboarding — pre-built agent templates and workflows for property management, healthcare, and construction, not generic automation."
              }
            }
          ]
        }) }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
