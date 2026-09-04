# Internal Tooling

Core principle: **Config where standard. Code where custom.**

This is a prototype runtime for standardized internal tools. It asks whether most normal internal applications can be described as TypeScript configuration files rather than bespoke React apps, while still allowing small custom components when the config language is not enough.

## 1. What was built

- A shared Next.js + TypeScript + React + Tailwind runtime.
- A `ToolConfig` schema that describes a tool's metadata, data, columns, filters, actions, roles, state transitions, reason requirements, audit requirements, and sensitive fields.
- Reusable runtime components: `AppShell`, `GenericToolView`, `DataTable`, `FilterBar`, `ActionModal`, `AuditHistory`, `RoleSwitcher`.
- A simulation of fintech-style controls: role-based permissions, PII masking, and audit logging.
- A `DataConnector<T>` abstraction with an in-memory mock implementation.
- Two example tools: **KYC Review** (`tools/kyc`) and **Refund Review** (`tools/refund`).
- A Devin Playbook (`playbooks/create-internal-tool.devin.md`) for adding future tools.

## 2. Architecture

```
app/
  page.tsx              # KYC Review wired through GenericToolView
  refunds/page.tsx      # Refund Review wired through GenericToolView
components/
  AppShell.tsx          # Navigation + layout
  runtime/              # Generic table, filters, action modal, audit history, GenericToolView
  tools/                # Optional custom tool views only when config is not enough
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

Tools are added by creating a directory under `tools/`, writing a `ToolConfig` and `DataConnector`, and registering the exported `ToolConfig` in `app/page.tsx`. A standard tool renders through `GenericToolView`; a custom `components/tools/` view is only needed when a workflow cannot be expressed in config.

## 3. Config-driven tool creation

A new standard tool primarily needs:

- `tools/<name>/data.ts` — record type and mock records.
- `tools/<name>/config.ts` — a `ToolConfig` object describing fields, columns, filters, actions, roles, state transitions, sensitive fields, and audit flags.
- `app/<route>/page.tsx` — a page that wires the config and connector into `GenericToolView`, plus any tiny custom rendering hooks.

Only when behavior cannot be expressed in `ToolConfig` or a rendering hook should a custom React component be introduced.

## 4. Shared fintech controls

- **Permissions**: `platform/auth/types.ts` provides `getRole`, `hasPermission`, `canViewSensitive`, and a `mask` helper. Sensitive fields are configured per tool and masked for roles without explicit access.
- **Audit**: `platform/audit/audit.ts` emits events for configured actions, capturing action name, record ID, acting role, timestamp, previous/new state, and reason when required.
- **Reason requirements**: Actions can require a reason before execution; the UI enforces this through `ActionModal`.

## 5. Connector abstraction

`DataConnector<T>` in `platform/connectors/connector.ts` defines a small interface for list, get, update, and create operations. `createMockConnector<T>` in `platform/connectors/mock.ts` provides an in-memory implementation. A real connector for a REST or internal API would implement the same interface and be swapped in at the tool config level.

## 6. Devin Playbook / Knowledge workflow

The playbook at `playbooks/create-internal-tool.devin.md` documents the procedure for adding a new tool. It prefers configuration over bespoke code, requires routing data access through the connector, and forbids bypassing shared permission logic.

## 7. How to add a new internal tool

The canonical way to add a tool is to have Devin follow `playbooks/create-internal-tool.devin.md`.

### Using the playbook with Devin

1. Open a new Devin session in this repository.
2. Load `playbooks/create-internal-tool.devin.md` as a rule or playbook.
3. Give Devin the business requirements: tool name, workflow/statuses, fields, roles, filters, actions, sensitive fields, and any special behavior.
4. Devin inspects the framework (`platform/config/types.ts`, `platform/auth/types.ts`, `platform/audit/audit.ts`, `platform/connectors/connector.ts`) and an existing tool such as `tools/kyc`.
5. Devin maps the requirements to a `ToolConfig`. Standard behavior (queue, filters, detail view, actions, audit, PII masking, permissions) is expressed entirely through config.
6. If a requirement cannot be represented in `ToolConfig`, Devin adds only the smallest necessary custom code, such as a typed guard function or a small React view in `components/tools/`.
7. Devin routes data access through `createMockConnector<T>` unless a real connector is explicitly justified.
8. Devin registers the tool in `app/page.tsx` (or in a dedicated `app/<route>/page.tsx` when a custom view needs its own route).
9. Devin runs `npm run lint` and `npm run build` and fixes failures.
10. Devin opens a pull request summarizing files added, config added, custom code, permissions, data access assumptions, and security assumptions.

### Why Devin can generate the tool

The runtime is intentionally constrained: `ToolConfig` is a complete description of a normal internal tool, and the generic components in `components/runtime/` interpret that description at runtime. Permissions, audit, masking, and data access are all handled by shared primitives, so adding a tool becomes a data-modeling and workflow-mapping exercise rather than a frontend-building exercise. The playbook encodes this mapping, making the task reproducible for Devin.

If a tool is too custom to fit the schema, the playbook explicitly falls back to a small custom component instead of expanding the configuration language.

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

Requirements:

- Node.js 18+ (20 recommended)
- npm

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The default page renders the KYC Review queue. Use the role switcher in the top-right to toggle between Reviewer and Senior Reviewer:

- **Reviewer**: can view cases, reject, and escalate. Sensitive PII is masked and the approve action is unavailable.
- **Senior Reviewer**: can view sensitive data and approve cases, including the high-risk approval path.

Selecting a case opens the detail view. Approving, rejecting, or escalating writes an event to the in-memory audit history shown in the case panel.

Validate changes before committing:

```bash
npm run lint
npm run build
```

Both must pass.

## 12. Deployment

This is a standard Next.js app.

```bash
npm run build
npm start
```

It can be deployed to Vercel, a Node.js container, or any host that supports Next.js. For a static export, add `output: 'export'` to `next.config.mjs`.
