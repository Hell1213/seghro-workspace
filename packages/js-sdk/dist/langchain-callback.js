"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeghroCallbackHandler = void 0;
const seghro_client_1 = require("./seghro-client");
class SeghroCallbackHandler {
    constructor(config) {
        this.spans = [];
        this.startTime = 0;
        this.client = new seghro_client_1.SeghroClient({ ...config, agentFramework: 'LangChain' });
    }
    async handleChainStart() { this.startTime = Date.now(); this.spans = []; }
    async handleLLMStart(llm, prompts) { this.spans.push({ name: 'llm_call', type: 'model', status: 'success', duration: 0, model: llm.id?.at(-1) || 'unknown' }); }
    async handleLLMEnd(output) {
        const last = this.spans[this.spans.length - 1];
        if (last?.name === 'llm_call') {
            last.duration = Date.now() - this.startTime;
            last.inputTokens = output.llmOutput?.tokenUsage?.promptTokens || 0;
            last.outputTokens = output.llmOutput?.tokenUsage?.completionTokens || 0;
        }
    }
    async handleChainEnd() { await this.client.ingestTrace({ status: 'success', duration: Date.now() - this.startTime, inputTokens: this.spans.reduce((s, sp) => s + (sp.inputTokens || 0), 0), outputTokens: this.spans.reduce((s, sp) => s + (sp.outputTokens || 0), 0), spans: this.spans }); }
    async handleChainError(error) { await this.client.ingestTrace({ status: 'error', duration: Date.now() - this.startTime, spans: this.spans, metadata: { error: error.message } }); }
}
exports.SeghroCallbackHandler = SeghroCallbackHandler;
