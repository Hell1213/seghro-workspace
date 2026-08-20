import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

const alertTemplates = [
  {
    title: '🚨 New silent failure detected',
    message: 'support-agent returned success but fabricated data in 3 of the last 10 traces.',
    severity: 'critical',
  },
  {
    title: '⚠️ Error rate spike detected',
    message: 'checkout-agent error rate increased from 3.2% to 18.7% in the last 5 minutes.',
    severity: 'warning',
  },
  {
    title: '✅ Issue auto-resolved',
    message: 'code-review-bot false positive rate dropped below threshold after prompt update.',
    severity: 'info',
  },
  {
    title: '🚨 Latency anomaly detected',
    message: 'research-agent p99 latency exceeded 30s threshold. 5 traces affected in last hour.',
    severity: 'critical',
  },
  {
    title: '📊 Daily reliability report',
    message: 'Overall agent reliability: 91.2% — 3 new issues detected, 1 auto-resolved.',
    severity: 'info',
  },
  {
    title: '⚠️ Token budget alert',
    message: 'onboarding-agent consumed 85% of daily token budget with 8 hours remaining.',
    severity: 'warning',
  },
  {
    title: '🚨 Regression detected',
    message: 'Online eval flagged 2 traces failing the refund_policy_violations check that was previously passing.',
    severity: 'critical',
  },
  {
    title: '✅ Deployment verified clean',
    message: 'All 5 agents passed post-deployment smoke tests. No new issues detected.',
    severity: 'info',
  },
];

function generateAlert() {
  const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...template,
    status: 'unread',
    channel: 'websocket',
    createdAt: new Date().toISOString(),
  };
}

console.log(`Alert streamer WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send an initial alert on connect
  ws.send(JSON.stringify({ type: 'new_alert', alert: generateAlert() }));

  // Stream new alerts every 8-15 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'new_alert', alert: generateAlert() }));
    }
  }, 8000 + Math.random() * 7000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    clearInterval(interval);
  });
});
