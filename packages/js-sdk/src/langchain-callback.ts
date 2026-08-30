import { SeghroClient } from './seghro-client';

export class SeghroCallbackHandler {
  private client: SeghroClient;
  private spans: any[] = [];
  private startTime = 0;

  constructor(config: { apiKey: string; agentName: string; endpoint?: string; debug?: boolean }) {
    this.client = new SeghroClient({ ...config, agentFramework: 'LangChain' });
  }

  async handleChainStart() { this.startTime = Date.now(); this.spans = []; }
  async handleLLMStart(llm: any, prompts: string[]) { this.spans.push({ name: 'llm_call', type: 'model', status: 'success', duration: 0, model: llm.id?.at(-1) || 'unknown' }); }
  async handleLLMEnd(output: any) {
    const last = this.spans[this.spans.length - 1];
    if (last?.name === 'llm_call') { last.duration = Date.now() - this.startTime; last.inputTokens = output.llmOutput?.tokenUsage?.promptTokens || 0; last.outputTokens = output.llmOutput?.tokenUsage?.completionTokens || 0; }
  }
  async handleChainEnd() { await this.client.ingestTrace({ status: 'success', duration: Date.now() - this.startTime, inputTokens: this.spans.reduce((s, sp) => s + (sp.inputTokens || 0), 0), outputTokens: this.spans.reduce((s, sp) => s + (sp.outputTokens || 0), 0), spans: this.spans }); }
  async handleChainError(error: Error) { await this.client.ingestTrace({ status: 'error', duration: Date.now() - this.startTime, spans: this.spans, metadata: { error: error.message } }); }
}
