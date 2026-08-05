# Dashboard Query Contract

## Shared Dashboard Filters

```typescript
interface DashboardFilters {
  dateFrom?: string; // ISO 8601 Date
  dateTo?: string; // ISO 8601 Date
  departmentId?: string; // UUID
  employeeId?: string; // UUID
  clientId?: string; // UUID
  productCategoryId?: string; // UUID
  status?: string;
  grouping?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  comparisonPeriod?: 'PREVIOUS_PERIOD' | 'SAME_PERIOD_LAST_YEAR' | 'NONE';
  timezone?: string;
  authorisedScope?: 'SELF' | 'DEPARTMENT' | 'GLOBAL';
}
```

## Common Metric Response Structure

```json
{
  "key": "String",
  "label": "String",
  "value": "Number",
  "unit": "String",
  "previousValue": "Number",
  "percentageChange": "Number",
  "trend": "UP | DOWN | FLAT",
  "dataPoints": [
    {
      "label": "String",
      "value": "Number"
    }
  ],
  "drillDownUrl": "String",
  "generatedAt": "OffsetDateTime"
}
```

## Contract Rules

- **Permission-Based Metric Visibility**: Metrics must be scoped based on the user's role and permissions (e.g., `DASHBOARD_READ`). `authorisedScope` determines if they see global, department, or self-level data.
- **Timezone Handling**: All dates passed from the client must be ISO 8601 UTC. The `timezone` field should dictate how the server groups data (e.g., start of day in America/New_York).
- **Empty-Data Behaviour**: If no data exists for a period, the API must return `value: 0` and empty `dataPoints` arrays, not a 404.
- **Date-Range Validation**: The backend must enforce maximum date ranges (e.g., max 2 years) to prevent performance issues.
- **Drill-Down Rules**: `drillDownUrl` should be a relative frontend path with pre-applied filter query parameters.
- **Metric Reconciliation with Source Records**: Aggregated metrics must perfectly match the sum of individual records in the drill-down view.
- **Caching Considerations**: Heavy dashboard queries may be cached via Redis or Spring Cache with a short TTL (e.g., 5-15 mins), returning `generatedAt` to inform the user of data freshness.
