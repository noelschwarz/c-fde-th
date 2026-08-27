# Create Internal Tool

## GOAL

Add a new internal application to this repository using the existing config-driven internal-tools framework. Prefer configuration over bespoke application code.

## REQUIRED INPUTS

- **Tool name** and intended route/path
- **Business workflow**: statuses, state transitions, and decision rules
- **Required data**: fields, types, and sample records
- **Required roles**: who can view, edit, approve, reject, etc.
- **Filters** and **search** fields the queue needs
- **Actions**: labels, allowed roles, state transitions, whether a reason is required, and audit need
- **Sensitive fields** that must be masked for low-privilege roles
- **Special/custom behavior** that cannot be expressed through `ToolConfig`

## PROCEDURE

1. Read the framework entry points: `platform/config/types.ts`, `platform/auth/types.ts`, `platform/audit/audit.ts`, and `platform/connectors/connector.ts`.
2. Read an existing tool config end-to-end, e.g. `tools/kyc/config.ts` and `tools/kyc/data.ts`.
3. Determine whether the new tool can be represented using the current `ToolConfig` schema. If it cannot, plan only the smallest custom React component needed.
4. If new roles or permissions are required, add them to `platform/auth/types.ts` or to the tool's `roles` array in its config.
5. Create `tools/<tool_name>/data.ts` with the record type and `initial<Data>Data` mock records.
6. Create `tools/<tool_name>/config.ts` exporting a `ToolConfig` object and any typed guard functions (e.g. `canApproveCase`).
   - Set `sensitiveFields` explicitly.
   - Give every mutating action `audit: true` and `stateTransitions`.
   - Add `requiresReason` and `reasonRequirements` where a reason is required.
7. Route all data access through the connector abstraction. Use `createMockConnector<T>` from `platform/connectors/mock.ts` unless a new connector type is explicitly justified.
8. Register the tool in navigation. Add the config to the `tools` array in `app/page.tsx` (or create `app/<route>/page.tsx` for a separate route) and render the appropriate tool view under `AppShell`.
9. If a custom view is unavoidable, create `components/tools/<ToolName>ToolView.tsx` and reuse `DataTable`, `FilterBar`, `ActionModal`, `AuditHistory`, and the shared auth/audit helpers. Do not duplicate those runtime components.
10. Add or update tests for the new config and any custom guards. If no test runner is configured, rely on `npm run lint`, `npm run build`, and a manual browser check.
11. Run `npm run lint` and `npm run build`. Fix all failures.
12. Summarize in the PR description:
    - files added
    - config added
    - custom code added (if any)
    - permissions model
    - data access assumptions
    - security assumptions

## SPECIFICATIONS

- The new tool must appear in the left navigation and reuse the existing `AppShell`.
- Standard queue, filters, detail view, and action modal behavior must be inherited from the runtime components.
- Permissions must be expressed through the shared primitives in `platform/auth/types.ts` (`getRole`, `hasPermission`, `canViewSensitive`, `mask`).
- Mutations must emit shared audit events either by `action.audit: true` in config or by calling `emit` from `platform/audit/audit.ts` in custom code.
- The production build (`npm run build`) and lint (`npm run lint`) must pass.

## ADVICE

- Reuse `DEFAULT_ROLES` and add permissions to the arrays rather than inventing a new authorization model.
- A custom component should cover only behavior that `ToolConfig` cannot express. Do not continuously expand the schema for one-off UI needs.
- For non-obvious state guards, export a typed helper function and wire it into `action.guard`.
- The mock connector is in-memory only, so state resets on page refresh. This is acceptable for this repo's fictional data.

## FORBIDDEN

- Do not create a separate application or bypass `AppShell`.
- Do not connect frontend components directly to production databases or external APIs.
- Do not place secrets, credentials, or real PII in source files.
- Do not duplicate existing platform components (`DataTable`, `FilterBar`, `ActionModal`, audit helpers) instead of reusing them.
- Do not over-expand the `ToolConfig` schema to model highly custom UI.
