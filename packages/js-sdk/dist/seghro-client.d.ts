export interface SeghroConfig {
    apiKey: string;
    endpoint?: string;
    agentName: string;
    agentFramework?: string;
    debug?: boolean;
}
export interface TraceInput {
    traceId?: string;
    status: 'success' | 'error' | 'timeout';
    duration: number;
    inputTokens?: number;
    outputTokens?: number;
    spans?: SpanInput[];
    metadata?: Record<string, unknown>;
}
export interface SpanInput {
    name: string;
    type?: 'model' | 'tool' | 'guard' | 'retrieval' | 'output' | 'custom';
    status: 'success' | 'error' | 'warning';
    duration: number;
    startTime?: number;
    model?: string;
    tool?: string;
    inputTokens?: number;
    outputTokens?: number;
}
export declare class SeghroClient {
    private apiKey;
    private endpoint;
    private agentName;
    private agentFramework;
    private debug;
    constructor(config: SeghroConfig);
    ingestTrace(input: TraceInput): Promise<{
        success: boolean;
        traceId?: string;
    }>;
}
