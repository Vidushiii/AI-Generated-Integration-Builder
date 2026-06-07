import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-20250514';

function getClient(userKey?: string) {
  const apiKey = userKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('NO_KEY');
  return new Anthropic({ apiKey });
}

export async function generateIntegration(
  docText: string,
  selectedOutputs: string[],
  userKey?: string
) {
  const client = getClient(userKey);

  const prompt = `You are an expert API integration engineer. Analyze the following API documentation and generate a complete, production-ready integration in TypeScript.

API Documentation:
${docText}

Generate the following integration components: ${selectedOutputs.join(', ')}.

Return a JSON object with this exact structure:
{
  "sections": [
    {
      "id": "api_client",
      "title": "API Client",
      "language": "typescript",
      "code": "// full code here"
    },
    // ... one object per requested component
  ],
  "gaps": [
    {
      "id": "gap_id",
      "message": "Description of what could not be inferred"
    }
  ]
}

Rules:
- Each code section must be complete, runnable TypeScript
- Flag any required values that cannot be inferred from the docs as gaps
- Include proper types, error handling within each section
- Use modern async/await patterns
- Do NOT wrap in markdown code blocks — return raw JSON only`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any accidental markdown fencing
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  return JSON.parse(cleaned);
}

export async function askAboutDoc(
  docText: string,
  question: string,
  userKey?: string
): Promise<string> {
  const client = getClient(userKey);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a helpful API documentation expert. Answer the following question about this API documentation concisely and accurately.

API Documentation:
${docText.slice(0, 20000)}

Question: ${question}

Answer in 2-4 sentences.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

export async function parseDocumentation(docText: string, userKey?: string) {
  const client = getClient(userKey);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Analyze this API documentation and extract key information. Return ONLY a JSON object with no markdown:

{
  "baseUrl": "the base API URL",
  "authModel": "authentication method description",
  "endpoints": [
    { "method": "GET", "path": "/example", "description": "what it does" }
  ],
  "rateLimit": "published rate limit from docs, or 'Not documented'",
  "risk": "low" | "medium" | "high"
}

Risk levels: low = read-only, medium = write operations, high = PII or bulk writes.

API Documentation:
${docText.slice(0, 30000)}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}
