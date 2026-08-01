# API Documentation - Zain Automation Platform v1.0 RC

## Base URL
Production Server: `https://<your-domain>.run.app`  
Local Dev Server: `http://localhost:3000`

---

## Endpoint Reference

### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-31T08:55:00.000Z",
  "version": "1.0.0-RC1"
}
```

---

### 2. AI & Gemini Proxy
```http
POST /api/gemini
Content-Type: application/json
```
**Request Body:**
```json
{
  "prompt": "Create an automated lead nurture workflow",
  "model": "gemini-2.5-flash",
  "temperature": 0.7
}
```
**Response:**
```json
{
  "response": "Here is the structured workflow JSON...",
  "tokensUsed": 342,
  "status": "success"
}
```

---

### 3. Computer Use Automation
```http
POST /api/computer-use
Content-Type: application/json
```
**Request Body:**
```json
{
  "targetUrl": "https://example.com/portal",
  "goal": "Extract monthly report table and download CSV",
  "requireApproval": true
}
```
**Response:**
```json
{
  "sessionId": "cu_sess_982310",
  "stepsExecuted": [
    { "action": "navigate", "target": "https://example.com/portal", "status": "completed" },
    { "action": "visual_grounding", "target": "table#reports", "status": "completed" },
    { "action": "extract_table", "rowsExtracted": 42, "status": "completed" }
  ],
  "status": "success"
}
```

---

### 4. Workflow Execution Endpoint
```http
POST /api/workflows/:id/execute
Content-Type: application/json
```
**Request Body:**
```json
{
  "workspaceId": "ws_12345",
  "triggerData": { "source": "webhook", "payload": { "event": "user.signup" } }
}
```
**Response:**
```json
{
  "executionId": "exec_77210",
  "workflowId": "wf_44810",
  "status": "completed",
  "durationMs": 1420
}
```

---

### 5. Secrets Vault Proxy
```http
POST /api/vault/decrypt
Content-Type: application/json
```
**Headers:**
```
Authorization: Bearer <workspace-jwt>
```
**Request Body:**
```json
{
  "secretKey": "STRIPE_SECRET_KEY",
  "workspaceId": "ws_12345"
}
```
**Response:**
```json
{
  "key": "STRIPE_SECRET_KEY",
  "value": "sk_live_...",
  "status": "decrypted"
}
```
