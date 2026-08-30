"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seghroTelemetry = seghroTelemetry;
const seghro_client_1 = require("./seghro-client");
function seghroTelemetry(config) {
    const client = new seghro_client_1.SeghroClient({ ...config, agentFramework: 'Vercel AI SDK' });
    return {
        isEnabled: true,
        recordEvent: async (event) => {
            if (event.name === 'ai.generateText.doGenerate') {
                await client.ingestTrace({ status: 'success', duration: event.attributes?.['ai.response.msToFirstChunk'] || 0, inputTokens: event.attributes?.['ai.usage.promptTokens'] || 0, outputTokens: event.attributes?.['ai.usage.completionTokens'] || 0 });
            }
        },
    };
}
