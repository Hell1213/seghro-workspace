"""LangChain callback handler for Seghro observability."""

from __future__ import annotations
import time
from seghro.client import SeghroClient

class SeghroCallbackHandler:
    def __init__(self, api_key: str, agent_name: str, endpoint: str = None, debug: bool = False):
        self.client = SeghroClient(api_key=api_key, agent_name=agent_name, agent_framework="LangChain", endpoint=endpoint or "https://seghro.dev/api/otlp/v1/traces", debug=debug)
        self.spans = []
        self.start_time = 0

    def on_chain_start(self, serialized, inputs, **kwargs):
        self.start_time = time.time()
        self.spans = []

    def on_llm_end(self, response, **kwargs):
        pass

    def on_chain_end(self, outputs, **kwargs):
        duration = (time.time() - self.start_time) * 1000
        self.client.ingest_trace(status="success", duration=duration, spans=self.spans)

    def on_chain_error(self, error, **kwargs):
        duration = (time.time() - self.start_time) * 1000
        self.client.ingest_trace(status="error", duration=duration, spans=self.spans)
