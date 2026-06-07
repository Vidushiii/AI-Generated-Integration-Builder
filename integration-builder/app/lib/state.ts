export type Mode = 'demo' | 'live';
export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Endpoint {
  method: string;
  path: string;
  description: string;
}

export interface ParsedDoc {
  baseUrl: string;
  authModel: string;
  endpoints: Endpoint[];
  rateLimit: string;
  risk: RiskLevel;
}

export interface CodeSection {
  id: string;
  title: string;
  language: string;
  code: string;
}

export interface Gap {
  id: string;
  message: string;
}

export interface GeneratedOutput {
  sections: CodeSection[];
  gaps: Gap[];
}

export interface SandboxResult {
  authPassed: boolean;
  dataPulled: boolean;
  errorCount: number;
  rateLimitBuffer: string;
  securityScanPassed: boolean;
  securityIssues: string[];
}

export const OUTPUT_CHOICES = [
  { id: 'api_client', label: 'API client' },
  { id: 'auth_setup', label: 'Auth setup' },
  { id: 'retrieve_data', label: 'Retrieve users & usage' },
  { id: 'error_handling', label: 'Error handling' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'logging', label: 'Logging' },
] as const;

export type OutputChoiceId = (typeof OUTPUT_CHOICES)[number]['id'];

export interface AppState {
  mode: Mode;
  step: Step;
  docText: string;
  docUrl: string;
  uploadedFileName: string;
  selectedPrompt: string;
  parsedDoc: ParsedDoc | null;
  selectedOutputs: OutputChoiceId[];
  generatedOutput: GeneratedOutput | null;
  sandboxResult: SandboxResult | null;
  userApiKey: string;
  showApiKeyModal: boolean;
  showSettingsModal: boolean;
  sandboxError: string | null;
}

export const initialState: AppState = {
  mode: 'demo',
  step: 1,
  docText: '',
  docUrl: '',
  uploadedFileName: '',
  selectedPrompt: '',
  parsedDoc: null,
  selectedOutputs: ['api_client', 'auth_setup', 'retrieve_data', 'error_handling', 'pagination', 'logging'],
  generatedOutput: null,
  sandboxResult: null,
  userApiKey: '',
  showApiKeyModal: false,
  showSettingsModal: false,
  sandboxError: null,
};
