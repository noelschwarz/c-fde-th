# Internal Tooling

Core principle: **Config where standard. Code where custom.**

This is a prototype runtime for standardized internal tools. It asks whether most normal internal applications can be described as TypeScript configuration files rather than bespoke React apps, while still allowing small custom components when the config language is not enough.

## 1. What was built

- A shared Next.js + TypeScript + React + Tailwind runtime.
- A `ToolConfig` schema that describes a tool's metadata, data, columns, filters, actions, roles, state transitions, reason requirements, audit requirements, and sensitive fields.
- Reusable runtime components: `AppShell`, `DataTable`, `FilterBar`, `ActionModal`, `AuditHistory`, `RoleSwitcher`.
- A simulation of fintech-style controls: role-based permissions, PII masking, and audit logging.
- A `DataConnector<T>` abstraction with an in-memory mock implementation.
- Two example tools: **KYC Review** (`tools/kyc`) and **Refund Review** (`tools/refund`).
- A Devin Playbook (`playbooks/create-internal-tool.devin.md`) for adding future tools.

## 2. Architecture

```
app/
  page.tsx              # Registers tools and renders the selected one inside AppShell
  refunds/page.tsx      # Example dedicated route for a custom tool view
components/
  AppShell.tsx          # Navigation + layout
  runtime/              # Generic table, filters, action modal, audit history
  tools/                # Optional custom tool views (e.g. KycToolView, RefundToolView)
platform/
  config/types.ts       # ToolConfig schema
  auth/types.ts         # Role/permission primitives and PII masking
  audit/audit.ts        # Audit event bus
  connectors/           # DataConnector interface + mock connector
tools/
  kyc/                  # Tool config, data, and guards
playbooks/
  create-internal-tool.devin.md
```

Tools are added by creating a directory under `tools/` and registering the exported `ToolConfig` in `app/page.tsx`.

## 3. Config-driven tool creation

A new standard tool primarily needs:

- `tools/<name>/data.ts` — record type and mock records.
- `tools/<name>/config.ts` — a `ToolConfig` object describing fields, columns, filters, actions, roles, state transitions, sensitive fields, and audit flags.

Only when behavior cannot be expressed in `ToolConfig` should a custom React component be introduced.

## 4. Shared fintech controls

- **Permissions**: `platform/auth/types.ts` provides `getRole`, `hasPermission`, `canViewSensitive`, and a `mask` helper. Sensitive fields are configured per tool and masked for roles without explicit access.
- **Audit**: `platform/audit/audit.ts` emits events for configured actions, capturing action name, record ID, acting role, timestamp, previous/new state, and reason when required.
- **Reason requirements**: Actions can require a reason before execution; the UI enforces this through `ActionModal`.

## 5. Connector abstraction

`DataConnector<T>` in `platform/connectors/connector.ts` defines a small interface for list, get, update, and create operations. `createMockConnector<T>` in `platform/connectors/mock.ts` provides an in-memory implementation. A real connector for a REST or internal API would implement the same interface and be swapped in at the tool config level.

## 6. Devin Playbook / Knowledge workflow

The playbook at `playbooks/create-internal-tool.devin.md` documents the procedure for adding a new tool. It prefers configuration over bespoke code, requires routing data access through the connector, and forbids bypassing shared permission logic.

## 7. How to add a new internal tool

Follow `playbooks/create-internal-tool.devin.md`.

Short version:

1. Inspect `platform/config/types.ts`, `platform/auth/types.ts`, `tools/kyc/config.ts`, and `tools/kyc/data.ts`.
2. Add roles/permissions to `platform/auth/types.ts` if the existing primitives are insufficient.
3. Create `tools/<name>/data.ts` and `tools/<name>/config.ts`.
4. Use `createMockConnector<T>` unless a real connector is explicitly justified.
5. Register the config in `app/page.tsx`.
6. Add a custom view in `components/tools/` only if `ToolConfig` cannot express the behavior.
7. Run `npm run lint` and `npm run build`; fix failures.

## 8. What is mocked

- **Authentication / identity**: Roles are toggled in the UI and stored in React state. There is no real identity provider or session.
- **Data**: All records live in an in-memory connector. Refreshing the page resets state.
- **Audit events**: The audit bus is in-memory. There is no persistence.
- **Authorization backend**: Permission checks run in the browser using shared helper logic. They are not enforced server-side.

## 9. What production implementation would still require

- Real identity provider and session management.
- Server-side authorization enforcement.
- Persistent database or API for records.
- Persistent audit store with tamper-evident logging.
- Real connectors for internal services, with error handling, retries, and authentication.
- PII handling that matches the organization's data classification, retention, and DLP policies.
- CI/CD, observability, feature flags, and environment management.

## 10. Explicit non-goals

This prototype does **not** recreate:

- A Power Apps-style connector ecosystem.
- Dataverse or an equivalent low-code data platform.
- Enterprise identity and access management.
- DLP / governance policy enforcement.
- Environment management or ALM for multiple deployments.
- Production reliability, SLA, or security guarantees.

The prototype instead tests whether Devin can materially reduce the marginal engineering cost of the specific internal tools it expects to build.

## 11. Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use the role switcher in the top-right to toggle between Reviewer and Senior Reviewer and observe permission, masking, and audit behavior.

## 12. Deployment

This is a standard Next.js app.

```bash
npm run build
npm start
```

It can be deployed to Vercel, a Node.js container, or any host that supports Next.js. For a static export, add `output: 'export'` to `next.config.mjs`.
