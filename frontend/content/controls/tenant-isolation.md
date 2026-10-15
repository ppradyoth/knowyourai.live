---
title: "Isolate tenants in retrieval"
description: "Apply tenant boundaries inside retrieval queries using the verified session. Test retrieved chunks across tenants before they reach the model."
stage: before-first-customer
builds: [rag, tool-calling-agent, agent-with-memory]
time: "45 min"
checklist: "Retrieval uses the session's tenant ID in the datastore query, and cross-tenant canaries never appear in retrieved chunks."
agent_rule: "Apply tenant filters inside retrieval queries in server code using the authenticated session. Prefer separate tenant namespaces or indexes when supported, and test retrieved chunks for cross-tenant leakage."
review: pending
updated: 2026-10-15
---

## The risk

If retrieval returns another tenant's chunks, the model has already received data the current user should not see. A prompt telling it to keep tenants separate cannot remove those chunks from its context. Filtering only the final answer also leaves the retrieval boundary unchecked.

## The fix

1. Resolve the tenant ID from the verified session on the server. Keep it out of the model-controlled search arguments. A request body that names a tenant is not evidence that the caller belongs to it.
2. Apply the tenant restriction in the datastore query that retrieves the chunks. Do not retrieve across every tenant and ask the model to choose which results it may use. Inspect the actual query sent by your adapter rather than just the function's parameter names.
3. Prefer a separate namespace or index for each tenant when your store supports it. Select that namespace from the same server-side session. A namespace selected from model output recreates the original problem under a different name.
4. Test the retrieved chunks before they enter the prompt. A model that omits a forbidden canary from its final reply can still have received it. Keep the retrieval result available to the test harness so it can check the boundary directly.

These examples show the tenant condition inside a simple text query. The Python example uses the standard-library SQLite connection. `queryDatabase` is your TypeScript database adapter, which must bind the supplied parameters using its actual driver's API. A vector store needs the equivalent restriction inside its search operation.

```ts
type QueryDatabase = (sql: string, params: string[]) => Promise<{ text: string }[]>;

export async function retrieve(query: string, session: { tenantId: string }, queryDatabase: QueryDatabase) {
  return queryDatabase(
    "SELECT text FROM chunks WHERE tenant_id = ? AND text LIKE ?",
    [session.tenantId, `%${query}%`],
  );
}
```

```python
import sqlite3

def retrieve(query: str, session: dict, connection: sqlite3.Connection) -> list[str]:
    rows = connection.execute(
        "SELECT text FROM chunks WHERE tenant_id = ? AND text LIKE ?",
        (session["tenant_id"], f"%{query}%"),
    ).fetchall()
    return [row[0] for row in rows]
```

Keep tenant selection in this server path even if the interface lets a user switch workspaces. Verify that the selected workspace belongs to the session before using its tenant ID. The model is not the component that establishes that relationship.

## Prove it works

Store a unique canary in tenant A's test data. Authenticate as tenant B and issue a query that would match that canary if the tenant restriction were absent. Assert that it never appears in the retrieved chunks, not just that the answer fails to repeat it.

Repeat with an ordinary matching record in B as a positive control. Inspect the datastore query or namespace selected during both calls. Keep the two-tenant fixture in the retrieval test suite so a query refactor cannot drop the restriction without failing a test.

## Know the limit

Tenant isolation in retrieval covers the query path you test. It does not automatically cover a tool that reads records by ID, stored agent memory or a cache populated elsewhere. Each data access still needs the user's normal permissions.
