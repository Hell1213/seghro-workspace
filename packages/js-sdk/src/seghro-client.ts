export interface SeghroConfig { apiKey: string; endpoint?: string; agentName: string; agentFramework?: string; debug?: boolean; }
export interface TraceInput { traceId?: string; status: 'success' | 'error' | 'timeout'; duration: number; inputTokens?: number; outputTokens?: number; spans?: SpanInput[]; metadata?: Record<string, unknown>; }
export interface SpanInput { name: string; type?: 'model' | 'tool' | 'guard' | 'retrieval' | 'output' | 'custom'; status: 'success' | 'error' | 'warning'; duration: number; startTime?: number; model?: string; tool?: string; inputTokens?: number; outputTokens?: number; }

export class SeghroClient {
  private apiKey: string;
  private endpoint: string;
  private agentName: string;
  private agentFramework: string;
  private debug: boolean;

  constructor(config: SeghroConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://seghro.dev/api/otlp/v1/traces';
    this.agentName = config.agentName;
    this.agentFramework = config.agentFramework || 'custom';
    this.debug = config.debug || false;
  }

  async ingestTrace(input: TraceInput): Promise<{ success: boolean; traceId?: string }> {
    const traceId = input.traceId || crypto.randomUUID();
    const now = Date.now();

    const payload = {
      resourceSpans: [{
        resource: { attributes: [{ key: 'service.name', value: { stringValue: this.agentName } }, { key: 'service.framework', value: { stringValue: this.agentFramework } }] },
        scopeSpans: [{
          scope: { name: '@seghro/sdk', version: '0.1.0' },
          spans: [{
            traceId, spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16), name: `${this.agentName}.run`, kind: 1,
            startTimeUnixNano: (now - input.duration) * 1_000_000, endTimeUnixNano: now * 1_000_000,
            attributes: [
              { key: 'agent.name', value: { stringValue: this.agentName } },
              { key: 'agent.framework', value: { stringValue: this.agentFramework } },
              { key: 'llm.usage.input_tokens', value: { intValue: String(input.inputTokens || 0) } },
              { key: 'llm.usage.output_tokens', value: { intValue: String(input.outputTokens || 0) } },
            ],
            status: { code: input.status === 'error' ? 2 : 0 },
          }],
        }],
      }],
    };

    try {
      const res = await fetch(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` }, body: JSON.stringify(payload) });
      if (this.debug) console.log(`[Seghro] Trace ${traceId}: ${res.status}`);
      return { success: res.ok, traceId };
    } catch (err) {
      if (this.debug) console.error('[Seghro] Failed:', err);
      return { success: false };
    }
  }
}
