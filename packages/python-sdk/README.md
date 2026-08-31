# Seghro Python SDK

**AI Agent Observability — one line of code.**

Trace every AI agent execution, detect silent failures, and auto-heal API outages.

## Install

```bash
pip install seghro
# With LangChain support:
pip install seghro[langchain]
```

## Quick Start

```python
from seghro import SeghroClient

seghro = SeghroClient(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

seghro.ingest_trace(
    status="success",
    duration=1200,
    input_tokens=150,
    output_tokens=300,
)
```

## LangChain Integration

```python
from seghro.langchain_callback import SeghroCallbackHandler

seghro_handler = SeghroCallbackHandler(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    callbacks=[seghro_handler],
)
```

## API Key

Get your API key at https://seghro.dev/dashboard/settings
