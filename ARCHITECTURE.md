# Architecture Overview - Zain Automation Platform

## Architectural Topology

```
+-----------------------------------------------------------------------------------+
|                                 Client Layer (SPA)                                |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Framer Motion       |
|  - Workflow Canvas & Visual Builder                                              |
|  - AI Agents OS & Multi-Provider Console                                         |
|  - Computer Use Engine Visual Simulator                                           |
|  - Node Marketplace & Workflow Inspector                                          |
|  - Multi-Tenant Workspace & Secrets Vault Console                                 |
+-----------------------------------------------------------------------------------+
                                          |
                                          | HTTPS / REST / Express
                                          v
+-----------------------------------------------------------------------------------+
|                              Server Layer (Node/Express)                          |
|  Port 3000 | Reverse Proxy Ingress | CORS & Proxy Middleware                       |
|                                                                                   |
|  +---------------------------+  +--------------------------+  +------------------+ |
|  | AI Proxy & Provider Routing|  | Computer Use Agent Proxy |  | Workflow Engine  | |
|  | - Gemini 2.5 Flash / Pro  |  | - Visual AI Grounding    |  | - Async Queue    | |
|  | - Claude 3.5 Sonnet       |  | - DOM Selector Recoverer |  | - Retries & DLQ  | |
|  | - GPT-4o & DeepSeek R1    |  | - Human Approval Guard   |  | - Step Execution | |
|  +---------------------------+  +--------------------------+  +------------------+ |
+-----------------------------------------------------------------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
+-----------------------------------------+   +-------------------------------------+
|        Firebase Services                |   |        External API Integrations     |
| - Firestore Multi-Tenant Collections    |   | - Stripe / Fawry MENA Checkout      |
| - Firebase Auth (Custom Tokens / Google)|   | - Google Workspace APIs             |
| - Enterprise Security Rules & RBAC      |   | - Webhooks & REST Integrations      |
+-----------------------------------------+   +-------------------------------------+
```

## Core Subsystems

### 1. Workflow Execution Engine
- **Async Execution Pipeline:** Executes workflow steps sequentially or in parallel with automatic step-level status tracking.
- **Dead Letter Queue (DLQ) & Resilience:** Implements 3-tier exponential backoff retries for transient HTTP and AI provider failures.
- **Node Catalog:** Over 100 pre-built nodes categorized by operational domain.

### 2. Autonomous Computer Use & Vision AI Engine
- **Visual AI Grounding:** Takes UI screenshots or DOM trees and converts them into precise interactive coordinates.
- **Self-Healing Selectors:** Fallback logic when target web elements change structure or dynamic IDs.
- **Human-in-the-Loop Guardrails:** Prompts workspace owners for explicit approval before executing financial, destructive, or administrative browser operations.

### 3. Zain AI Agents OS
- **Multi-Provider Matrix:** Seamless routing across Google Gemini, Anthropic Claude, OpenAI, and DeepSeek models.
- **Skill Execution Engine:** Agents query skills including Computer Use, Secrets Vault keys, Workspace data, and External Webhooks.

### 4. Multi-Tenant Security & Secrets Vault
- **Workspace Data Isolation:** Strict workspace ID filtering across Firestore security rules.
- **AES-256 Vault:** Client-side zero-knowledge masking with server-side proxy decryption.
