export declare function seghroTelemetry(config: {
    apiKey: string;
    agentName: string;
    endpoint?: string;
}): {
    isEnabled: boolean;
    recordEvent: (event: any) => Promise<void>;
};
