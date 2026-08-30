"""Seghro Python SDK — trace ingestion client."""

from __future__ import annotations
import time
import uuid
from typing import Any, Optional
import httpx


class SeghroClient:
    def __init__(self, api_key: str, agent_name: str, agent_framework: str = "custom", endpoint: str = "https://seghro.dev/api/otlp/v1/traces", debug: bool = False):
        self.api_key = api_key
        self.endpoint = endpoint
        self.agent_name = agent_name
        self.agent_framework = agent_framework
        self.debug = debug
        self._client = httpx.Client(timeout=10.0)

    def ingest_trace(self, status: str = "success", duration: float = 0, input_tokens: int = 0, output_tokens: int = 0, spans: Optional[list] = None, metadata: Optional[dict] = None) -> dict:
        trace_id = str(uuid.uuid4())
        now_ns = int(time.time() * 1_000_000_000)
        payload = {
            "resourceSpans": [{
                "resource": {"attributes": [{"key": "service.name", "value": {"stringValue": self.agent_name}}, {"key": "service.framework", "value": {"stringValue": self.agent_framework}}]},
                "scopeSpans": [{
                    "scope": {"name": "seghro.python", "version": "0.1.0"},
                    "spans": [{
                        "traceId": trace_id, "spanId": uuid.uuid4().hex[:16], "name": f"{self.agent_name}.run", "kind": 1,
                        "startTimeUnixNano": str(now_ns - int(duration * 1_000_000)), "endTimeUnixNano": str(now_ns),
                        "attributes": [{"key": "agent.name", "value": {"stringValue": self.agent_name}}, {"key": "llm.usage.input_tokens", "value": {"intValue": str(input_tokens)}}, {"key": "llm.usage.output_tokens", "value": {"intValue": str(output_tokens)}}],
                        "status": {"code": 2 if status == "error" else 0},
                    }],
                }],
            }]
        }
        try:
            res = self._client.post(self.endpoint, json=payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"})
            return {"success": res.is_success, "traceId": trace_id}
        except Exception:
            return {"success": False}

    def close(self):
        self._client.close()
