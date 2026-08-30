export interface RouteResult {
  success: boolean;
  provider: string;
  response?: Response;
  error?: string;
  latency: number;
}

const PROVIDER_URLS: Record<string, string> = {
  'OpenAI GPT-4o': 'https://api.openai.com/v1',
  'Anthropic Claude 3.5': 'https://api.anthropic.com/v1',
  'Google Gemini Pro': 'https://generativelanguage.googleapis.com/v1',
  'Meta Llama 3': 'https://api.llama.com/v1',
  'Stripe': 'https://api.stripe.com/v1',
  'Adyen': 'https://checkout.adyen.com/v1',
  'PayPal': 'https://api.paypal.com/v1',
  'Tavily': 'https://api.tavily.com',
  'Brave Search': 'https://api.search.brave.com',
  'Bing Web Search': 'https://api.bing.microsoft.com/v1',
  'Pinecone': 'https://api.pinecone.io',
  'Weaviate': 'https://api.weaviate.io',
  'ChromaDB': 'https://api.trychroma.com',
};

export async function routeWithFallback(
  endpointName: string,
  category: 'llm' | 'payment' | 'database' | 'search' | 'mcp',
  requestFn: (providerName: string, providerUrl: string) => Promise<Response>
): Promise<RouteResult> {
  const chain = getFallbackChain(category);
  const startIndex = chain.findIndex(p => p.toLowerCase().includes(endpointName.toLowerCase()));
  const orderedProviders = [...chain.slice(startIndex), ...chain.slice(0, startIndex)];

  for (const provider of orderedProviders) {
    const url = PROVIDER_URLS[provider] || '';
    const start = Date.now();
    try {
      const response = await requestFn(provider, url);
      return { success: response.ok, provider, response, latency: Date.now() - start };
    } catch (err) {
      continue;
    }
  }

  return { success: false, provider: 'none', error: 'All providers failed', latency: 0 };
}

function getFallbackChain(category: 'llm' | 'payment' | 'database' | 'search' | 'mcp'): string[] {
  const chains: Record<string, string[]> = {
    llm: ['OpenAI GPT-4o', 'Anthropic Claude 3.5', 'Google Gemini Pro', 'Meta Llama 3'],
    payment: ['Stripe', 'Adyen', 'PayPal'],
    database: ['Pinecone', 'Weaviate', 'ChromaDB'],
    search: ['Tavily', 'Brave Search', 'Bing Web Search'],
    mcp: ['GitHub MCP', 'GitLab MCP', 'Local Tools'],
  };
  return chains[category] || [];
}
