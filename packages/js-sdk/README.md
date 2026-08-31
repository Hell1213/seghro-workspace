# @seghro/sdk

**AI Agent Observability for JavaScript/TypeScript — one line of code.**

Trace every AI agent execution, detect silent failures, and auto-heal API outages.

## Install

```bash
npm install @seghro/sdk
```

## Quick Start

```typescript
import { SeghroClient } from '@seghro/sdk';

const seghro = new SeghroClient({
  apiKey: 'seghro_sk_...',
  agentName: 'my-agent',
});

await seghro.ingestTrace({
  status: 'success',
  duration: 1200,
  inputTokens: 150,
  outputTokens: 300,
});
```

## LangChain Integration

```typescript
import { SeghroCallbackHandler } from '@seghro/sdk';

const seghroHandler = new SeghroCallbackHandler({
  apiKey: 'seghro_sk_...',
  agentName: 'my-agent',
});

const chain = new LLMChain({
  llm,
  prompt,
  callbacks: [seghroHandler],
});
```

## Vercel AI SDK Integration

```typescript
import { seghroTelemetry } from '@seghro/sdk';

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello!',
  experimental_telemetry: seghroTelemetry({
    apiKey: 'seghro_sk_...',
    agentName: 'my-agent',
  }),
});
```

## API Key

Get your API key at https://seghro.dev/dashboard/settings
