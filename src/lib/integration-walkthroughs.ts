export interface WalkthroughStep {
  title: string
  description: string
  inputField?: string
  inputPlaceholder?: string
}

export interface IntegrationWalkthroughData {
  id: string
  name: string
  icon: string
  category: string
  steps: WalkthroughStep[]
}

export const INTEGRATION_WALKTHROUGHS: Record<string, IntegrationWalkthroughData> = {
  google: {
    id: 'google',
    name: 'Google Workspace',
    icon: '🔵',
    category: 'Productivity',
    steps: [
      { title: 'Create a Google Cloud Project', description: 'Go to console.cloud.google.com and create a new project (or select an existing one). Name it something like "Zynthr Integration".' },
      { title: 'Enable APIs', description: 'In the API Library, enable Gmail API, Google Calendar API, and Google Drive API for your project.' },
      { title: 'Configure OAuth Consent Screen', description: 'Go to APIs & Services → OAuth consent screen. Choose "Internal" if you have a Workspace org, or "External" for testing. Fill in app name, support email, and scopes.' },
      { title: 'Create OAuth Credentials', description: 'Go to APIs & Services → Credentials → Create Credentials → OAuth client ID. Choose "Web application". Add your Zynthr callback URL as an authorized redirect URI.', inputField: 'clientId', inputPlaceholder: 'Paste your OAuth Client ID' },
      { title: 'Enter Client Secret', description: 'Copy the client secret from the credentials page and paste it below.', inputField: 'clientSecret', inputPlaceholder: 'Paste your OAuth Client Secret' },
      { title: 'Verify Connection', description: 'Click "Verify" below to test your Google Workspace connection. We\'ll confirm the credentials are valid.' },
    ],
  },
  m365: {
    id: 'm365',
    name: 'Microsoft 365',
    icon: '📧',
    category: 'Productivity',
    steps: [
      { title: 'Register an App in Azure AD', description: 'Go to portal.azure.com → Azure Active Directory → App registrations → New registration. Name it "Zynthr Integration" and set the redirect URI to your Zynthr callback URL.' },
      { title: 'Configure API Permissions', description: 'In your app registration, go to API permissions → Add a permission → Microsoft Graph. Add: Mail.Read, Calendars.Read, Files.Read.All. Then click "Grant admin consent".' },
      { title: 'Create a Client Secret', description: 'Go to Certificates & secrets → New client secret. Set an expiry and copy the secret value immediately (it won\'t be shown again).' },
      { title: 'Enter Application (Client) ID', description: 'Find your Application (client) ID on the app\'s Overview page and paste it below.', inputField: 'clientId', inputPlaceholder: 'Paste your Application (Client) ID' },
      { title: 'Enter Client Secret', description: 'Paste the client secret you created in step 3.', inputField: 'clientSecret', inputPlaceholder: 'Paste your Client Secret value' },
      { title: 'Enter Tenant ID', description: 'Find your Directory (tenant) ID on the app\'s Overview page.', inputField: 'tenantId', inputPlaceholder: 'Paste your Directory (Tenant) ID' },
      { title: 'Verify Connection', description: 'Click "Verify" below to test your Microsoft 365 connection.' },
    ],
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    category: 'Communication',
    steps: [
      { title: 'Create a Slack App', description: 'Go to api.slack.com/apps and click "Create New App". Choose "From scratch", name it "Zynthr Bot", and select your workspace.' },
      { title: 'Configure Bot Permissions', description: 'Go to OAuth & Permissions → Scopes → Bot Token Scopes. Add: chat:write, channels:read, users:read, files:read.' },
      { title: 'Install App to Workspace', description: 'Click "Install to Workspace" at the top of the OAuth & Permissions page. Authorize the app when prompted.' },
      { title: 'Enter Bot Token', description: 'After installing, copy the "Bot User OAuth Token" (starts with xoxb-) and paste it below.', inputField: 'botToken', inputPlaceholder: 'xoxb-your-bot-token' },
      { title: 'Verify Connection', description: 'Click "Verify" below to test your Slack bot connection.' },
    ],
  },
  docusign: {
    id: 'docusign',
    name: 'DocuSign',
    icon: '✍️',
    category: 'Documents',
    steps: [
      { title: 'Create a DocuSign Developer Account', description: 'Go to developers.docusign.com and sign up for a free developer account if you don\'t have one.' },
      { title: 'Create an Integration Key', description: 'In the DocuSign Admin panel, go to Settings → Integrations → Apps and Keys → Add App and Integration Key.' },
      { title: 'Configure Authentication', description: 'Choose "Authorization Code Grant" as the auth type. Add your Zynthr callback URL as the redirect URI.' },
      { title: 'Enter Integration Key', description: 'Paste your DocuSign Integration Key (Client ID) below.', inputField: 'integrationKey', inputPlaceholder: 'Paste your Integration Key' },
      { title: 'Enter API Account ID', description: 'Find your API Account ID in Account → Settings → Apps and Keys.', inputField: 'accountId', inputPlaceholder: 'Paste your API Account ID' },
      { title: 'Verify Connection', description: 'Click "Verify" below to test your DocuSign connection.' },
    ],
  },
  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks',
    icon: '📊',
    category: 'Finance',
    steps: [
      { title: 'Create a QuickBooks Developer Account', description: 'Go to developer.intuit.com and sign in. Navigate to "My Apps" and click "Create an app".' },
      { title: 'Configure App Settings', description: 'In your app settings, add your Zynthr callback URL as a redirect URI. Select the scopes you need (Accounting, Payments).' },
      { title: 'Get Your Credentials', description: 'Go to Keys & credentials. Copy the Client ID and Client Secret from the Production or Development tab.' },
      { title: 'Enter Client ID', description: 'Paste your QuickBooks OAuth Client ID below.', inputField: 'clientId', inputPlaceholder: 'Paste your Client ID' },
      { title: 'Enter Client Secret', description: 'Paste your QuickBooks OAuth Client Secret below.', inputField: 'clientSecret', inputPlaceholder: 'Paste your Client Secret' },
      { title: 'Verify Connection', description: 'Click "Verify" below to test your QuickBooks connection.' },
    ],
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    category: 'Payments',
    steps: [
      { title: 'Access Your Stripe Dashboard', description: 'Go to dashboard.stripe.com and sign in to your Stripe account.' },
      { title: 'Navigate to API Keys', description: 'Go to Developers → API keys. You\'ll see your Publishable key and can reveal your Secret key.' },
      { title: 'Enter Publishable Key', description: 'Copy your Publishable key (starts with pk_live_ or pk_test_) and paste it below.', inputField: 'publishableKey', inputPlaceholder: 'pk_live_...' },
      { title: 'Enter Secret Key', description: 'Click "Reveal live key", copy it, and paste below. This key is sensitive — Zynthr encrypts it at rest.', inputField: 'secretKey', inputPlaceholder: 'sk_live_...' },
      { title: 'Verify Connection', description: 'Click "Verify" below to test your Stripe connection.' },
    ],
  },
}
