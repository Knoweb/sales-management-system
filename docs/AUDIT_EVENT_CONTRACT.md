# Audit Event Contract

## Audit Record Structure

```json
{
  "id": "UUID",
  "eventType": "String",
  "actorUserId": "UUID",
  "actorNameSnapshot": "String",
  "entityType": "String",
  "entityId": "UUID",
  "action": "String",
  "previousState": "JSON",
  "newState": "JSON",
  "comments": "String",
  "occurredAt": "OffsetDateTime",
  "correlationId": "String",
  "requestPath": "String",
  "metadata": "JSON"
}
```

## Contract Rules

- **Append-Only**: Audit records are strictly append-only.
- **No Updates**: Normal application APIs cannot update audit records under any circumstances.
- **No Deletes**: Normal application APIs cannot delete audit records.
- **Actor Name Snapshots**: `actorNameSnapshot` is captured at the time of the event and remains unchanged, even if the user later changes their name.
- **State Formats**: `previousState` and `newState` should be structured JSON representations of the entity, stripped of relationships unless strictly necessary.
- **Sensitive-Data Exclusion Rules**: Passwords, tokens, payment secrets, and PII must be masked or completely excluded from `previousState`, `newState`, and `metadata`.
- **Permission Requirements**: Users require the `AUDIT_LOG_READ` permission to view audit trails.
- **Filtering and Pagination Expectations**: The frontend and API must support cursor or offset-based pagination and filtering by `entityType`, `entityId`, `actorUserId`, and `dateRange`.
