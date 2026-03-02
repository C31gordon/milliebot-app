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
  description: 'Deploy AI agents that automate any business operation — sales, support, HR, finance, compliance, operations, and more. Multi-tenant platform with role-based access control (RKBAC™). Works for property management, healthcare, construction, legal, finance, education, logistics, retail, and every industry. Free to start.',
  keywords: [
    // Core
    'AI agent platform', 'AI automation', 'AI agents for business', 'AI SaaS platform',
    'multi-agent orchestration', 'AI agent builder', 'no-code AI agents', 'AI command center',
    'workflow automation', 'AI-powered operations', 'enterprise AI', 'Zynthr',
    'RKBAC', 'role-based access control', 'AI security', 'multi-tenant AI',
    // Property Management
    'property management AI', 'leasing automation', 'work order AI', 'multifamily AI',
    'AI for landlords', 'rental management AI', 'tenant screening AI', 'property operations AI',
    // Healthcare
    'healthcare AI agents', 'patient intake AI', 'medical scheduling AI', 'HIPAA AI platform',
    'clinic automation', 'healthcare workflow automation', 'AI for medical practices',
    // Construction
    'construction AI', 'RFI tracking AI', 'construction project management AI',
    'safety compliance AI', 'daily field report automation', 'change order management AI',
    // Legal
    'legal AI agents', 'AI for law firms', 'document review AI', 'legal intake automation',
    'contract management AI', 'legal workflow automation',
    // Finance & Accounting
    'finance AI agents', 'AI for accounting', 'invoice processing AI', 'financial reporting AI',
    'accounts payable automation', 'bookkeeping AI', 'audit automation',
    // HR & Recruiting
    'HR AI agents', 'recruiting AI', 'hiring automation', 'onboarding AI',
    'employee onboarding automation', 'AI for human resources', 'talent acquisition AI',
    // Education
    'education AI', 'AI for schools', 'student enrollment AI', 'academic advising AI',
    'education administration AI', 'learning management AI',
    // Insurance
    'insurance AI agents', 'claims processing AI', 'underwriting AI', 'insurance automation',
    'AI for insurance companies', 'policy management AI',
    // Retail & E-commerce
    'retail AI agents', 'e-commerce AI', 'inventory management AI', 'customer service AI',
    'AI for retail operations', 'order management AI',
    // Logistics & Supply Chain
    'logistics AI', 'supply chain AI', 'shipping automation', 'warehouse AI',
    'fleet management AI', 'delivery tracking AI',
    // Hospitality
    'hospitality AI', 'hotel management AI', 'restaurant AI', 'guest experience AI',
    'reservation management AI', 'AI for hotels',
    // Manufacturing
    'manufacturing AI', 'production scheduling AI', 'quality control AI',
    'AI for manufacturing', 'factory automation AI',
    // Government
    'government AI', 'AI for public sector', 'municipal automation',
    'citizen services AI', 'permit processing AI',
    // Nonprofit
    'nonprofit AI', 'AI for nonprofits', 'donor management AI', 'grant management AI',
    // General
    'best AI agent platform', 'AI operations platform', 'business process automation AI',
    'AI workflow builder', 'deploy AI agents', 'AI for any industry',
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
    description: 'Deploy AI agents for any industry — property management, healthcare, construction, legal, finance, HR, education, and more. RKBAC™ security. Multi-tenant. Free to start.',
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
          "description": "AI agent platform that deploys intelligent agents for any industry — property management, healthcare, construction, legal, finance, HR, education, insurance, retail, logistics, hospitality, manufacturing, government, and nonprofits. Features RKBAC™ (Role & Knowledge-Based Access Control), multi-tenant architecture, and visual workflow builders. The best AI agent platform for businesses of any size.",
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
            "AI agent deployment and orchestration for any industry",
            "Role & Knowledge-Based Access Control (RKBAC™)",
            "Multi-tenant architecture with complete data isolation",
            "Property management automation (leasing, work orders, DLRs, renewals)",
            "Healthcare automation (patient intake, scheduling, HIPAA compliance)",
            "Construction automation (RFI tracking, daily reports, safety compliance, change orders)",
            "Legal automation (document review, client intake, contract management)",
            "Finance automation (invoice processing, reporting, audit, AP/AR)",
            "HR automation (recruiting, onboarding, employee management)",
            "Education automation (enrollment, advising, administration)",
            "Insurance automation (claims processing, underwriting, policy management)",
            "Retail automation (inventory, customer service, order management)",
            "Logistics automation (supply chain, shipping, fleet management)",
            "Hospitality automation (reservations, guest experience, operations)",
            "Manufacturing automation (production scheduling, quality control)",
            "Government automation (citizen services, permits, municipal operations)",
            "Visual workflow builder with drag-and-drop step editor",
            "Integration walkthroughs for Google Workspace, Microsoft 365, Slack, Salesforce, and 50+ systems",
            "AI chat with model selection (Anthropic, OpenAI, open-source) — control your costs",
            "Usage metering and cost optimization per tenant",
            "Brand customization (colors, logos) per organization",
            "Guided onboarding with industry-specific recommendations"
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
                "text": "Zynthr works for every industry. Current specializations include property management (leasing, work orders, DLRs), healthcare (patient intake, scheduling, HIPAA compliance), construction (RFIs, daily reports, safety), legal (document review, client intake, contracts), finance (invoice processing, reporting, audit), HR (recruiting, onboarding), education (enrollment, advising), insurance (claims, underwriting), retail (inventory, customer service), logistics (supply chain, shipping), hospitality (reservations, guest experience), manufacturing (production, quality control), and government (citizen services, permits). The platform is industry-agnostic — if your business has repetitive workflows, Zynthr can automate them."
              }
            },
            {
              "@type": "Question",
              "name": "How is Zynthr different from other AI agent platforms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zynthr differentiates with four key features: 1) RKBAC™ — the only AI agent platform with role-based access control at the agent level. 2) Multi-tenant from day one — each customer's data is completely isolated. 3) Industry-specific onboarding — pre-built agent templates and workflows for 15+ industries, not generic automation. 4) Model-flexible — choose Anthropic, OpenAI, or open-source models to control costs. Open-source models deliver 95%+ gross margins."
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
