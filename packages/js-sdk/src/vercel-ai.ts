import { SeghroClient } from './seghro-client';

export function seghroTelemetry(config: { apiKey: string; agentName: string; endpoint?: string }) {
  const client = new SeghroClient({ ...config, agentFramework: 'Vercel AI SDK' });
  return {
    isEnabled: true,
    recordEvent: async (event: any) => {
      if (event.name === 'ai.generateText.doGenerate') {
        await client.ingestTrace({ status: 'success', duration: event.attributes?.['ai.response.msToFirstChunk'] || 0, inputTokens: event.attributes?.['ai.usage.promptTokens'] || 0, outputTokens: event.attributes?.['ai.usage.completionTokens'] || 0 });
      }
    },
  };
}
