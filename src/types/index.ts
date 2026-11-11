export type NavigationTabId = 'smart-data-mock' | 'test-cases' | 'api-validator';

export type AutomationFramework = 'Playwright' | 'Cypress' | 'Robot Framework';

export type ContractValidationFramework =
  | 'Playwright API + Zod'
  | 'Cypress + AJV'
  | 'Postman (Chai)';

export interface NavigationItem {
  id: NavigationTabId;
  label: string;
  badge?: string;
  disabled?: boolean;
  description: string;
}

export interface MockDataRequest {
  prompt: string;
  count?: number;
  locale?: 'pt-BR' | 'en-US';
  includeEdgeCases?: boolean;
}

export interface BddGenerationRequest {
  prompt: string;
  framework: AutomationFramework;
}

export interface ApiContractRequest {
  payloadJson: string;
  framework: ContractValidationFramework;
}

export interface AIResponse {
  payload: string;
  recordsCount: number;
  executionTimeMs: number;
  model: string;
  timestamp: string;
}

export interface PromptPreset {
  id: string;
  title: string;
  category: string;
  prompt: string;
}
