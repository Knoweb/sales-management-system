# Notification Event Contract

## Notification Event Envelope

```json
{
  "eventId": "UUID",
  "eventType": "String",
  "occurredAt": "OffsetDateTime",
  "actorUserId": "UUID",
  "actorName": "String",
  "entityType": "String",
  "entityId": "UUID",
  "recipientUserIds": ["UUID"],
  "title": "String",
  "message": "String",
  "contextUrl": "String",
  "deduplicationKey": "String",
  "correlationId": "String",
  "metadata": "JSON"
}
```

## Contract Rules

- **Event Naming Convention**: `[ENTITY]_[ACTION]` in uppercase (e.g., `PROJECT_BRIEF_APPROVED`, `LEAD_ASSIGNED`).
- **Deduplication Rules**: The `deduplicationKey` must be a unique string (e.g., hash of entityId, eventType, and date) to prevent duplicate notifications for the same logical event within a specific timeframe.
- **Retry Safety**: Notification consumers and processors must be idempotent. Processing the same `eventId` or `deduplicationKey` multiple times should not create duplicate database records.
- **Recipient Resolution**: The service producing the event should attempt to resolve `recipientUserIds`. If broad roles are targeted, the notification service must resolve the active users within those roles.
- **Null-Recipient Handling**: If `recipientUserIds` is empty or null, the event may be dropped or logged as a warning, but it must not cause an exception or crash.
- **Read/Unread Behaviour**: Notifications are unread by default upon creation. Setting `readAt` marks it as read. A notification can be read but not unread.
- **Permission Requirements**: Users must have `NOTIFICATION_READ` permission to view their notifications.
- **Context-Link Behaviour**: The `contextUrl` provides a direct frontend link to the entity in question. It should be a relative path (e.g., `/leads/{id}`).
- **Module Integration Rules**: Modules should publish events asynchronously to avoid blocking the main transaction.
