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

  entrata: {
    id: 'entrata',
    name: 'Entrata',
    icon: '🏠',
    category: 'Property Management',
    steps: [
      { title: 'Request API Access', description: 'Contact your Entrata account manager or submit a request at entrata.com to enable API access for your property management company.' },
      { title: 'Get Your API Credentials', description: 'Once approved, Entrata will provide you with an API username, password, and your property IDs. These are different from your login credentials.' },
      { title: 'Enter API Username', description: 'Paste the API username provided by Entrata.', inputField: 'apiUsername', inputPlaceholder: 'Your Entrata API username' },
      { title: 'Enter API Password', description: 'Paste the API password provided by Entrata.', inputField: 'apiPassword', inputPlaceholder: 'Your Entrata API password' },
      { title: 'Enter Property IDs', description: 'Enter the property IDs you want to connect (comma-separated for multiple properties).', inputField: 'propertyIds', inputPlaceholder: 'e.g. 12345, 67890' },
      { title: 'Verify Connection', description: 'Click "Verify" to test your Entrata API connection. We\'ll pull a sample report to confirm access.' },
    ],
  },
  yardi: {
    id: 'yardi',
    name: 'Yardi Voyager',
    icon: '🏢',
    category: 'Property Management',
    steps: [
      { title: 'Contact Yardi Support', description: 'Request API access from your Yardi account representative. You\'ll need to specify which interfaces you need (e.g., ResidentConnect, Accounting, Maintenance).' },
      { title: 'Receive SOAP/REST Credentials', description: 'Yardi will provide your API endpoint URL, username, password, and database/server details.' },
      { title: 'Enter Server URL', description: 'Paste your Yardi Voyager server URL.', inputField: 'serverUrl', inputPlaceholder: 'https://www.yaboroyardi.com/...' },
      { title: 'Enter Username & Password', description: 'Enter the API credentials provided by Yardi.', inputField: 'username', inputPlaceholder: 'Your Yardi API username' },
      { title: 'Enter Database Name', description: 'Enter the database name for your Yardi instance.', inputField: 'database', inputPlaceholder: 'Your database name' },
      { title: 'Verify Connection', description: 'Click "Verify" to test your Yardi connection.' },
    ],
  },
  drchrono: {
    id: 'drchrono',
    name: 'DrChrono EHR',
    icon: '🩺',
    category: 'Healthcare',
    steps: [
      { title: 'Register as a Developer', description: 'Go to app.drchrono.com/api-management and register your integration. DrChrono uses OAuth 2.0.' },
      { title: 'Create an Application', description: 'In the API management panel, create a new application. Set the redirect URI to your Zynthr callback URL.' },
      { title: 'Configure Scopes', description: 'Select the data access scopes you need: patients:read, clinical:read, calendar:read, billing:read. Minimize scope for HIPAA compliance.' },
      { title: 'Enter Client ID', description: 'Copy the Client ID from your DrChrono application settings.', inputField: 'clientId', inputPlaceholder: 'Your DrChrono Client ID' },
      { title: 'Enter Client Secret', description: 'Copy the Client Secret. This is encrypted at rest in Zynthr.', inputField: 'clientSecret', inputPlaceholder: 'Your DrChrono Client Secret' },
      { title: 'Verify & Authorize', description: 'Click "Verify" to initiate the OAuth flow. You\'ll be redirected to DrChrono to authorize access.' },
    ],
  },
  athenahealth: {
    id: 'athenahealth',
    name: 'athenahealth',
    icon: '🏥',
    category: 'Healthcare',
    steps: [
      { title: 'Apply for Marketplace Access', description: 'Go to developer.athenahealth.com and apply for API access. Approval typically takes 1-2 weeks for healthcare integrations.' },
      { title: 'Complete Sandbox Testing', description: 'Once approved, you\'ll receive sandbox credentials. Test your integration in the sandbox environment before going live.' },
      { title: 'Request Production Access', description: 'After passing sandbox tests, request production API keys from athenahealth.' },
      { title: 'Enter API Key', description: 'Paste your athenahealth API key.', inputField: 'apiKey', inputPlaceholder: 'Your athenahealth API key' },
      { title: 'Enter API Secret', description: 'Paste your athenahealth API secret.', inputField: 'apiSecret', inputPlaceholder: 'Your athenahealth API secret' },
      { title: 'Enter Practice ID', description: 'Enter your athenahealth practice ID.', inputField: 'practiceId', inputPlaceholder: 'Your Practice ID' },
      { title: 'Verify Connection', description: 'Click "Verify" to test your athenahealth connection.' },
    ],
  },
}
