import type { ParsedDoc, GeneratedOutput, SandboxResult } from './state';

export const mockParsedDoc: ParsedDoc = {
  baseUrl: 'https://api.calendly.com',
  authModel: 'OAuth 2.0 / Personal Access Token (Bearer)',
  endpoints: [
    { method: 'GET', path: '/users/me', description: 'Get current authenticated user' },
    { method: 'GET', path: '/users/{uuid}', description: 'Get a specific user by UUID' },
    { method: 'GET', path: '/event_types', description: 'List all event types for a user' },
    { method: 'GET', path: '/scheduled_events', description: 'List scheduled events' },
    { method: 'GET', path: '/scheduled_events/{uuid}/invitees', description: 'List event invitees' },
    { method: 'GET', path: '/organization_memberships', description: 'List organization memberships' },
  ],
  rateLimit: '100 requests/second per user token (documented)',
  risk: 'low',
};

export const mockGeneratedOutput: GeneratedOutput = {
  sections: [
    {
      id: 'api_client',
      title: 'API Client',
      language: 'typescript',
      code: `import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class CalendlyClient {
  private client: AxiosInstance;
  private baseURL = 'https://api.calendly.com';

  constructor(private accessToken: string) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      timeout: 30_000,
    });

    this.client.interceptors.response.use(
      (res) => res,
      (err) => this.handleError(err)
    );
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res: AxiosResponse<T> = await this.client.get(path, { params });
    return res.data;
  }

  async getPaginated<T>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<T[]> {
    const results: T[] = [];
    let nextPage: string | null = path;

    while (nextPage) {
      const data: any = await this.get(nextPage, params);
      results.push(...(data.collection ?? []));
      nextPage = data.pagination?.next_page ?? null;
      params = undefined; // next_page URL already has params
    }

    return results;
  }

  private handleError(err: any): never {
    if (err.response) {
      const { status, data } = err.response;
      throw new CalendlyError(status, data?.message ?? 'Unknown error', data);
    }
    throw err;
  }
}

export class CalendlyError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(\`Calendly API [\${status}]: \${message}\`);
    this.name = 'CalendlyError';
  }
}`,
    },
    {
      id: 'auth_setup',
      title: 'Auth Setup',
      language: 'typescript',
      code: `// Personal Access Token (PAT) flow — easiest for server-side integrations.
// For OAuth 2.0 web flow, provide the redirect URI and client credentials below.

export interface AuthConfig {
  accessToken?: string;         // PAT from Calendly settings
  clientId?: string;            // OAuth app client ID
  clientSecret?: string;        // OAuth app client secret
  // redirectUri: string;       // ⚠ GAP: OAuth redirect URI not found in docs — provide this
}

export async function getAuthToken(config: AuthConfig): Promise<string> {
  if (config.accessToken) {
    return config.accessToken;
  }

  if (config.clientId && config.clientSecret) {
    // OAuth 2.0 client credentials exchange
    const res = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(\`Auth failed [\${res.status}]: \${err.error_description ?? 'unknown'}\`);
    }

    const { access_token } = await res.json();
    return access_token as string;
  }

  throw new Error('Either accessToken or (clientId + clientSecret) required');
}

// Usage
// const token = await getAuthToken({ accessToken: process.env.CALENDLY_TOKEN });
// const client = new CalendlyClient(token);`,
    },
    {
      id: 'retrieve_data',
      title: 'Retrieve Users & Usage',
      language: 'typescript',
      code: `import { CalendlyClient } from './apiClient';

interface User {
  uri: string;
  name: string;
  email: string;
  timezone: string;
  created_at: string;
}

interface ScheduledEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
}

interface UsageSummary {
  user: User;
  totalEvents: number;
  upcomingEvents: number;
  cancelledEvents: number;
  eventsByType: Record<string, number>;
}

export async function getCurrentUser(client: CalendlyClient): Promise<User> {
  const data: any = await client.get('/users/me');
  return data.resource;
}

export async function getUserUsage(
  client: CalendlyClient,
  userUri: string,
  minStartTime?: string,
  maxStartTime?: string
): Promise<UsageSummary> {
  const user = await getCurrentUser(client);

  const params: Record<string, string> = { user: userUri };
  if (minStartTime) params.min_start_time = minStartTime;
  if (maxStartTime) params.max_start_time = maxStartTime;

  const events = await client.getPaginated<ScheduledEvent>('/scheduled_events', params);

  const summary: UsageSummary = {
    user,
    totalEvents: events.length,
    upcomingEvents: events.filter((e) => e.status === 'active').length,
    cancelledEvents: events.filter((e) => e.status === 'canceled').length,
    eventsByType: {},
  };

  for (const event of events) {
    const type = event.event_type ?? 'unknown';
    summary.eventsByType[type] = (summary.eventsByType[type] ?? 0) + 1;
  }

  return summary;
}`,
    },
    {
      id: 'error_handling',
      title: 'Error Handling',
      language: 'typescript',
      code: `import { CalendlyError } from './apiClient';

export interface RetryConfig {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULT_RETRY: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 10_000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = { ...DEFAULT_RETRY, ...config };
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (err instanceof CalendlyError) {
        // Don't retry on auth errors or bad requests
        if (err.status === 401 || err.status === 403 || err.status === 422) throw err;

        // Respect rate limit headers
        if (err.status === 429) {
          const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
          console.warn(\`[Calendly] Rate limited. Retrying in \${delay}ms (attempt \${attempt}/\${maxAttempts})\`);
          await sleep(delay);
          continue;
        }

        // Retry on 5xx
        if (err.status >= 500) {
          const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
          console.warn(\`[Calendly] Server error \${err.status}. Retrying in \${delay}ms\`);
          await sleep(delay);
          continue;
        }
      }

      throw err;
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
    },
    {
      id: 'pagination',
      title: 'Pagination',
      language: 'typescript',
      code: `// Calendly uses cursor-based pagination via next_page URLs.
// The CalendlyClient.getPaginated() method handles this automatically.
// This module provides additional helpers for streaming large datasets.

import { CalendlyClient } from './apiClient';

export interface Page<T> {
  items: T[];
  nextPageUrl: string | null;
  count: number;
}

export async function* streamPages<T>(
  client: CalendlyClient,
  path: string,
  params?: Record<string, unknown>
): AsyncGenerator<Page<T>> {
  let nextUrl: string | null = path;
  let currentParams: Record<string, unknown> | undefined = params;

  while (nextUrl) {
    const data: any = await client.get(nextUrl, currentParams);
    const items: T[] = data.collection ?? [];
    const nextPageUrl: string | null = data.pagination?.next_page ?? null;

    yield { items, nextPageUrl, count: data.pagination?.count ?? items.length };

    nextUrl = nextPageUrl;
    currentParams = undefined;
  }
}

// Example: process events page by page without loading all into memory
export async function processEventsInBatches(
  client: CalendlyClient,
  userUri: string,
  onBatch: (events: any[]) => Promise<void>
) {
  for await (const page of streamPages(client, '/scheduled_events', { user: userUri })) {
    await onBatch(page.items);
    console.log(\`[Calendly] Processed \${page.items.length} events (total available: \${page.count})\`);
  }
}`,
    },
    {
      id: 'logging',
      title: 'Logging',
      language: 'typescript',
      code: `export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  ts: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private context: string;
  private minLevel: LogLevel;
  private levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  constructor(context: string, minLevel: LogLevel = 'info') {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel) {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.minLevel);
  }

  private write(level: LogLevel, message: string, data?: unknown) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      message: \`[\${this.context}] \${message}\`,
      data,
    };

    // In production, send to your observability platform (Datadog, Grafana, etc.)
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(JSON.stringify(entry));
  }

  debug(msg: string, data?: unknown) { this.write('debug', msg, data); }
  info(msg: string, data?: unknown)  { this.write('info',  msg, data); }
  warn(msg: string, data?: unknown)  { this.write('warn',  msg, data); }
  error(msg: string, data?: unknown) { this.write('error', msg, data); }

  child(subContext: string) {
    return new Logger(\`\${this.context}:\${subContext}\`, this.minLevel);
  }
}

export const logger = new Logger('Calendly', process.env.LOG_LEVEL as LogLevel ?? 'info');

// Usage
// logger.info('Fetching user', { userUri });
// logger.error('API call failed', { status: err.status, message: err.message });`,
    },
  ],
  gaps: [
    {
      id: 'oauth_redirect',
      message: 'Could not infer OAuth redirect URI — provide CALENDLY_REDIRECT_URI in your environment.',
    },
  ],
};

export const mockSandboxResult: SandboxResult = {
  authPassed: true,
  dataPulled: true,
  errorCount: 0,
  rateLimitBuffer: '94% remaining (6/100 req/s used)',
  securityScanPassed: true,
  securityIssues: [],
};

export const mockQnA: Record<string, string> = {
  default:
    "The Calendly API uses Bearer token authentication. You can use either a Personal Access Token (PAT) or OAuth 2.0. The base URL is https://api.calendly.com and the rate limit is 100 requests per second per token.",
  auth: "Calendly supports two auth methods: Personal Access Tokens (PATs) for server-to-server integrations, and OAuth 2.0 for user-facing apps. PATs are simpler — generate one in Calendly settings and pass it as a Bearer token.",
  rate: "The documented rate limit is 100 requests per second per user token. The generated integration includes automatic retry-with-backoff for 429 responses.",
  endpoint:
    "Key endpoints: GET /users/me (current user), GET /scheduled_events (list events, supports pagination), GET /event_types (list event types), GET /organization_memberships (org members).",
};
