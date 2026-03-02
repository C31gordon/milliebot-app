/**
 * RKBAC Model Access Control
 * 
 * Controls which AI models each user tier can access.
 * Org admins can also set a model lock that overrides everything.
 * 
 * Tier 1 (Owner/Exec): All models
 * Tier 2 (Dept Head): Up to Claude Sonnet / GPT-4.1
 * Tier 3 (Manager): Up to Claude Haiku / GPT-4.1 Mini / all open-source
 * Tier 4 (Staff): Open-source only
 */

export interface ModelDef {
  id: string
  name: string
  provider: string
  costTier: '¢' | '$' | '$$' | '$$$'
  minRkbacTier: number // 1 = owner only, 4 = everyone
}

export const MODEL_CATALOG: ModelDef[] = [
  // Open source (¢) — available to all tiers
  { id: 'llama-4-maverick',  name: 'Llama 4 Maverick',  provider: 'Together AI', costTier: '¢',   minRkbacTier: 4 },
  { id: 'deepseek-v3',       name: 'DeepSeek V3',       provider: 'Together AI', costTier: '¢',   minRkbacTier: 4 },
  { id: 'qwen3-235b',        name: 'Qwen3 235B',        provider: 'Together AI', costTier: '¢',   minRkbacTier: 4 },
  // Mid-tier ($) — Tier 3+
  { id: 'claude-4-haiku',    name: 'Claude 4 Haiku',    provider: 'Anthropic',   costTier: '$',   minRkbacTier: 3 },
  { id: 'gpt-4.1-mini',      name: 'GPT-4.1 Mini',      provider: 'OpenAI',      costTier: '$',   minRkbacTier: 3 },
  // Upper-tier ($$) — Tier 2+
  { id: 'claude-4-sonnet',   name: 'Claude 4 Sonnet',   provider: 'Anthropic',   costTier: '$$',  minRkbacTier: 2 },
  { id: 'gpt-4.1',           name: 'GPT-4.1',           provider: 'OpenAI',      costTier: '$$',  minRkbacTier: 2 },
  // Premium ($$$) — Tier 1 only
  { id: 'claude-4-opus',     name: 'Claude 4 Opus',     provider: 'Anthropic',   costTier: '$$$', minRkbacTier: 1 },
  { id: 'gpt-5',             name: 'GPT-5',             provider: 'OpenAI',      costTier: '$$$', minRkbacTier: 1 },
]

/**
 * Get models available to a user based on their RKBAC tier.
 * If modelLock is set, only that model is returned (regardless of tier).
 */
export function getAvailableModels(userTier: number, modelLock?: string): ModelDef[] {
  // Model lock overrides everything — admin locked to a specific model
  if (modelLock) {
    const locked = MODEL_CATALOG.find(m => m.id === modelLock)
    return locked ? [locked] : MODEL_CATALOG.filter(m => m.minRkbacTier >= 4) // fallback to open-source
  }
  
  // Filter by RKBAC tier — user can access models where their tier <= minRkbacTier requirement
  return MODEL_CATALOG.filter(m => userTier <= m.minRkbacTier)
}

/**
 * Check if a user can use a specific model.
 */
export function canUseModel(modelId: string, userTier: number, modelLock?: string): boolean {
  if (modelLock) return modelId === modelLock
  const model = MODEL_CATALOG.find(m => m.id === modelId)
  if (!model) return false
  return userTier <= model.minRkbacTier
}

/**
 * Get the default model for a user's tier.
 * Always defaults to cheapest available.
 */
export function getDefaultModel(userTier: number, modelLock?: string): string {
  if (modelLock) return modelLock
  const available = getAvailableModels(userTier)
  return available[0]?.id || 'llama-4-maverick'
}
