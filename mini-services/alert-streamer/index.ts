import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

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

console.log(`[AlertStreamer] Socket.IO server starting on port ${PORT}`);

io.on('connection', (socket) => {
  console.log(`[AlertStreamer] Client connected: ${socket.id}`);

  // Join the 'alerts' room for alert broadcasting
  socket.join('alerts');
  console.log(`[AlertStreamer] Socket ${socket.id} joined room: alerts`);

  // Send an initial alert on connect
  const initialAlert = generateAlert();
  socket.emit('new-alert', initialAlert);

  // Handle custom ping/pong
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[AlertStreamer] Client disconnected: ${socket.id} (reason: ${reason})`);
  });

  socket.on('error', (err) => {
    console.error(`[AlertStreamer] Socket error on ${socket.id}:`, err);
  });
});

// Broadcast alerts to 'alerts' room every 8-15 seconds
const alertInterval = setInterval(() => {
  const alert = generateAlert();
  io.to('alerts').emit('new-alert', alert);
}, 8000 + Math.random() * 7000);

// Broadcast API health events every 8 seconds
const healthInterval = setInterval(() => {
  const endpoints = ['ep-tavily', 'ep-anthropic-claude', 'ep-openai-gpt4o', 'ep-github-mcp'];
  const randomEp = endpoints[Math.floor(Math.random() * endpoints.length)];
  const events = [
    { type: 'health_check_passed', endpointId: randomEp, latency: Math.floor(Math.random() * 500 + 50), status: 'healthy' },
    { type: 'latency_spike', endpointId: randomEp, latency: Math.floor(Math.random() * 1500 + 500), status: 'degraded' },
    { type: 'health_check_failed', endpointId: 'ep-tavily', latency: 0, status: 'down' },
    { type: 'circuit_breaker_state', endpointId: randomEp, newState: ['closed', 'half-open', 'open'][Math.floor(Math.random() * 3)] },
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  io.to('alerts').emit('api-health-event', event);
}, 8000);

httpServer.listen(PORT, () => {
  console.log(`[AlertStreamer] Socket.IO server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[AlertStreamer] Shutting down...');
  clearInterval(alertInterval);
  clearInterval(healthInterval);
  io.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[AlertStreamer] Shutting down...');
  clearInterval(alertInterval);
  clearInterval(healthInterval);
  io.close();
  process.exit(0);
});
