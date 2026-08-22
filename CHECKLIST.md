# Sentinel V8 — Pre-Launch Production Checklist

> **Instructions**: Complete every item before going live. Mark each with `[x]` when done.

---

## 1. Environment & Configuration

- [ ] **NEXTAUTH_URL** set to production domain (e.g. `https://sentinel.dev`)
- [ ] **NEXTAUTH_SECRET** generated with `openssl rand -base64 32` and set in K8s Secret
- [ ] **DATABASE_URL** points to production database (not SQLite file path)
- [ ] **GITHUB_ID** and **GITHUB_SECRET** configured for OAuth (GitHub Developer Settings)
- [ ] **ZAI_API_KEY** set for AI features
- [ ] **NODE_ENV** set to `production` in all deployments
- [ ] All placeholder values in `k8s/secret.yaml` replaced with real credentials
- [ ] ConfigMap `DATABASE_URL` updated with production connection string

## 2. TLS & Security

- [ ] TLS certificate provisioned (cert-manager with Let's Encrypt, or cloud-managed cert)
- [ ] TLS secret `sentinel-tls` exists in the `sentinel` namespace
- [ ] Ingress host `sentinel.dev` updated to real domain name
- [ ] HTTPS redirect enforced (nginx `force-ssl-redirect` annotation)
- [ ] Security headers set (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [ ] CSP (Content Security Policy) headers verified correct
- [ ] CORS configuration allows only expected origins

## 3. Database

- [ ] Database migrated to production (run `bun run db:push` or equivalent)
- [ ] Database backup automated (daily, encrypted, off-cluster storage)
- [ ] Backup restore tested (restore to a fresh instance and verify data integrity)
- [ ] Database connection pooling configured
- [ ] PVC `sentinel-db-pvc` bound and writable

## 4. Kubernetes Deployment

- [ ] All manifests applied in order: namespace → configmap → secret → pvc → deployments → services → ingress → hpa
- [ ] All pods running and in `Ready` state (`kubectl get pods -n sentinel`)
- [ ] Health checks passing: liveness and readiness probes green
- [ ] HPA active and can scale up/down (`kubectl get hpa -n sentinel`)
- [ ] Resource limits tested under load (no OOMKills)
- [ ] Pod anti-affinity / topology spread working (pods on different nodes)
- [ ] Rolling update tested (deploy new image version, verify zero-downtime)

## 5. API & Endpoints

- [ ] `GET /api/health` returns `200 OK`
- [ ] All 11 API routes return correct status codes:
  - [ ] `/api/agents`
  - [ ] `/api/traces`
  - [ ] `/api/issues`
  - [ ] `/api/alerts`
  - [ ] `/api/metrics`
  - [ ] `/api/endpoints`
  - [ ] `/api/healing`
  - [ ] `/api/api-health`
  - [ ] `/api/activity`
  - [ ] `/api/self-heal`
  - [ ] `/api/health`
- [ ] Rate limiting tested — verify 429 responses on abuse
- [ ] Error responses return proper JSON with status codes (not HTML error pages)

## 6. Authentication

- [ ] Login flow tested (email/password)
- [ ] Registration flow tested (new user sign-up)
- [ ] GitHub OAuth flow tested end-to-end (redirect → authorize → callback → session)
- [ ] Session persistence works across page reloads
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Logout clears session correctly

## 7. Real-Time (WebSocket)

- [ ] Alert streamer pod running and healthy
- [ ] WebSocket connection establishes on dashboard load
- [ ] Alerts stream in real-time to the browser
- [ ] Connection recovers on network interruption (reconnect logic)
- [ ] Multiple concurrent clients receive alerts simultaneously

## 8. Frontend Quality

- [ ] Error boundary catches and displays errors gracefully
- [ ] Dark/light theme toggle works without flash or blink
- [ ] All pages responsive on mobile, tablet, and desktop
- [ ] All interactive elements have hover/focus states
- [ ] Lighthouse audit completed:
  - [ ] Performance ≥ 90
  - [ ] Accessibility ≥ 90
  - [ ] Best Practices ≥ 90
  - [ ] SEO ≥ 90
- [ ] No console errors in production build

## 9. Load Testing

- [ ] Load test executed with 100 concurrent users
- [ ] P95 latency within acceptable threshold (< 1s)
- [ ] P99 latency within acceptable threshold (< 2s)
- [ ] Error rate < 1% under load
- [ ] No memory leaks detected (monitor over 30+ minute sustained load)
- [ ] HPA scales pods up under load (verify replica count increases)

## 10. Monitoring & Alerting

- [ ] Prometheus scraping all targets (`targets` page shows UP)
- [ ] Grafana dashboard imported and displaying data
- [ ] Alert rules loaded in Prometheus (`kubectl get prometheusrule`)
- [ ] Alert notifications working:
  - [ ] Slack webhook delivers alerts
  - [ ] Email notifications deliver alerts
- [ ] On-call rotation configured (PagerDuty, Opsgenie, or equivalent)

## 11. Runbook & Documentation

- [ ] Runbook created for common incidents (pod crash, DB down, high latency)
- [ ] Rollback procedure documented and tested
- [ ] K8s manifest apply order documented
- [ ] Environment variable reference documented

---

### Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| SRE | | | |
| Product | | | |
