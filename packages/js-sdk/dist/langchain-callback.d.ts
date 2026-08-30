export declare class SeghroCallbackHandler {
    private client;
    private spans;
    private startTime;
    constructor(config: {
        apiKey: string;
        agentName: string;
        endpoint?: string;
        debug?: boolean;
    });
    handleChainStart(): Promise<void>;
    handleLLMStart(llm: any, prompts: string[]): Promise<void>;
    handleLLMEnd(output: any): Promise<void>;
    handleChainEnd(): Promise<void>;
    handleChainError(error: Error): Promise<void>;
}
