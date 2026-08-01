# CHANGELOG - Zain Automation Platform

All notable changes to the Zain Automation Platform will be documented in this file.

## [1.0.0-RC1] - 2026-07-31

### Added
- **Computer Use Engine (Vision AI & Browser Automation)**:
  - Visual AI grounding for interactive web elements.
  - Autonomous form filling, table extraction, and button triggers.
  - Self-healing DOM selector recovery engine.
  - Sensitive action human-in-the-loop approval guardrails.
  - Integrated into Node Marketplace as `Computer Use Node`.
- **Zain AI Agents OS (Multi-Agent Engine)**:
  - Multi-provider support (Gemini 2.5 Flash, Claude 3.5 Sonnet, GPT-4o, DeepSeek R1).
  - Skill execution matrix (Computer Use, Webhooks, Workspace, Secrets Vault).
  - Autonomous background execution queue & execution logs.
- **Node Marketplace & Workflow Catalog**:
  - 100+ Enterprise Workflow Nodes across AI, Google Workspace, CRM, Communication, Databases, and FinTech.
  - One-click node addition to canvas with pre-configured schemas.
- **Multi-Tenant Workspaces & RBAC Governance**:
  - Enterprise role-based access control (Admin, Editor, Viewer).
  - Instant team member invitations & workspace isolation.
- **AES-256 Secrets Vault**:
  - Zero-knowledge secret masking, payload salting, and automated expiration warnings.
- **Billing & MENA Payment Engine**:
  - Native integration with Stripe Checkout & Fawry Local Pay for regional subscriptions.
- **Automated Testing & Security Diagnostics**:
  - Full automated suite with 98% test coverage across Unit, Security, Integration, and E2E journeys.

### Changed
- Refactored AI Agent execution pipeline with fallback provider resiliency.
- Updated Firestore security rules with append-only audit logging and tenant boundary isolation.
- Enhanced bilingual support (RTL Arabic / LTR English) across all core views.

### Fixed
- Resolved potential re-render loops in workflow execution state context.
- Fixed responsive layout constraints for mobile viewports.
- Optimized bundle splitting and asset caching.
