---
title: "Handle your users' API keys safely"
description: "Encrypt saved provider keys using a KMS or secret-manager integration, keep them out of logs and responses, and use each key only for its owner."
stage: before-first-customer
builds: [chatbot, tool-calling-agent, llm-judge]
time: "45 min"
checklist: "User provider keys are encrypted at rest, never logged or returned after saving, deletable and used only for the owning user's requests."
agent_rule: "Encrypt users' provider keys at rest with a KMS or secret manager. Never log or return saved keys, show only their last four characters, support deletion and resolve each key from its authenticated owner."
review: pending
updated: 2026-10-15
---

## The risk

Accepting a user's provider key makes your application another place that credential can leak. A settings response, trace or shared lookup can expose it after the user saves it. A key that belongs to one user must not become a fallback credential for another user's request.

## The fix

1. Encrypt saved keys at rest with an encryption key held in a KMS or secret manager. Keep the encryption integration on the server. Do not treat encoding a string or hiding it in the interface as encryption of the stored value.
2. Never log the key. Review save failures, provider failures and traces as well as the successful request path. A redacted settings screen does not protect a credential that an error handler writes elsewhere.
3. After saving, return only the last four characters for display. Do not send the saved full key back to the browser. Build the settings response from explicit display metadata rather than serializing the stored record.
4. Let users delete their keys. Resolve the saved key from the authenticated user for each request, and use it only for that user's provider calls. Do not select an owner from model output or fall back to a different user's saved key.

These examples define application adapters for your documented KMS or secret-manager integration. `vault` encrypts and decrypts on the server using the key held by that service. The snippets do not implement cryptography or claim these method names exist in a vendor SDK. The map represents your encrypted storage record.

```ts
type Vault = { encrypt: (key: string) => Promise<string>; decrypt: (ciphertext: string) => Promise<string> };
const saved = new Map<string, { ciphertext: string; last4: string }>();

export async function saveKey(userId: string, key: string, vault: Vault) {
  saved.set(userId, { ciphertext: await vault.encrypt(key), last4: key.slice(-4) });
  return { last4: key.slice(-4) };
}
export function deleteKey(userId: string) { saved.delete(userId); }
export async function callForUser(userId: string, vault: Vault, callProvider: (key: string) => Promise<string>) {
  const record = saved.get(userId);
  if (!record) throw new Error("no_saved_key");
  return callProvider(await vault.decrypt(record.ciphertext));
}
```

```python
saved: dict[str, dict] = {}

def save_key(user_id: str, key: str, encrypt) -> dict:
    saved[user_id] = {"ciphertext": encrypt(key), "last4": key[-4:]}
    return {"last4": key[-4:]}

def delete_key(user_id: str) -> None:
    saved.pop(user_id, None)

def call_for_user(user_id: str, decrypt, call_provider) -> str:
    record = saved.get(user_id)
    if record is None:
        raise PermissionError("no_saved_key")
    return call_provider(decrypt(record["ciphertext"]))
```

Supply `userId` from the verified session in every handler. The provider adapter uses the decrypted credential for authentication, not as prompt content. Your persistent store needs to retain the ciphertext and display suffix rather than the original key.

## Prove it works

Save a distinctive fake key through the real settings path. Search logs, traces and subsequent API responses for the full marker, including after a failed provider call. Confirm that the settings response shows only the suffix and that the persistent record contains ciphertext rather than the marker.

Make requests as two different test users and observe which credential the provider adapter receives. Delete one user's key and confirm that their next call cannot use the other user's credential. Keep provider calls stubbed for these tests so the fake values never need to authenticate to a real service.

## Know the limit

Encryption at rest does not stop a server that can decrypt a key from misusing it. These examples also depend on the authentication and KMS adapters you supply. Check those paths and the trace destinations rather than treating an encrypted column as the whole control.
