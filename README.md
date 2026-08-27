# c-fde-th

Cognition: Technical take-home challenge (NS)

## Stack

- Next.js 14 (App Router)
- TypeScript
- React
- Tailwind CSS

## Structure

- `app/` — Next.js app router pages
- `components/` — Shared runtime UI components
- `platform/` — Shared runtime primitives
  - `config/` — ToolConfig schema
  - `auth/` — Role/permission simulation and PII masking
  - `audit/` — Audit event bus
  - `connectors/` — DataConnector interface and mock connector
- `tools/` — Tool-specific config and mock data
- `playbooks/` — Operational playbooks (non-code)

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## KYC Review tool

The default page renders the KYC Review queue. Use the role switcher in the top-right to toggle between Reviewer and Senior Reviewer permissions and observe PII masking, action availability, and audit logging.
