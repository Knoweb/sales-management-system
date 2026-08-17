export const formatEventType = (eventType: string): string => {
  if (!eventType) return 'Unknown Event';
  // Convert USER_CREATED -> User Created
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatAuditFieldName = (fieldName: string): string => {
  const customMappings: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    roles: 'System Role',
    active: 'Account Status',
    passwordChangeRequired: 'Password Change Required',
    employeeNumber: 'Employee Number',
    marketingCampaign: 'Marketing Campaign',
    assignedSalesOfficer: 'Assigned Sales Officer',
    followUpDate: 'Follow-up Date',
    quotationId: 'Quotation Reference',
    jobTitle: 'Job Title',
    department: 'Department',
    clientName: 'Client Name',
    contactPerson: 'Contact Person',
    contactNumber: 'Contact Number',
    status: 'Status',
    id: 'ID',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    createdBy: 'Created By',
    updatedBy: 'Updated By'
  };

  if (customMappings[fieldName]) {
    return customMappings[fieldName];
  }

  // Fallback: camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

export const formatAuditValue = (value: any, fieldName?: string): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    if (fieldName === 'active') return value ? 'Active' : 'Inactive';
    if (fieldName === 'passwordChangeRequired') return value ? 'Required' : 'Not Required';
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'string') {
        return value.map(v => formatAuditValue(v, fieldName)).join(', ');
      }
      return `[ ${value.length} items ]`;
    }
    // Attempt to extract useful fields from nested object
    if (value.name) return String(value.name);
    if (value.title) return String(value.title);
    if (value.reference) return String(value.reference);
    if (value.id) return String(value.id);
    return 'Complex Data';
  }

  if (typeof value === 'string') {
    // Check if it's a date string roughly
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }

    // Enum formatting (e.g. SYSTEM_ADMIN -> System Administrator)
    const enumMappings: Record<string, string> = {
      SYSTEM_ADMIN: 'System Administrator',
      TOP_MANAGEMENT: 'Top Management',
      SALES_MANAGER: 'Sales Manager',
      SALES_OFFICER: 'Sales Officer',
      ENGINEER: 'Engineer',
      MARKETING: 'Marketing',
      PENDING_CLIENT_APPROVAL: 'Pending Client Approval',
      CLIENT_ACCEPTED: 'Client Accepted',
      CLIENT_REJECTED: 'Client Rejected',
      NO_RESPONSE: 'No Response',
      QUOTATION_CLIENT_RESPONSE: 'Quotation Client Response'
    };

    if (enumMappings[value]) {
      return enumMappings[value];
    }

    // Default enum formatting if uppercase with underscores
    if (/^[A-Z_]+$/.test(value) && value.includes('_')) {
       return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return String(value);
};

export const getChangedFields = (previousState: any, newState: any) => {
  const changes: Array<{ field: string; prev: any; next: any }> = [];
  
  let prev = {};
  let next = {};
  
  try {
      prev = typeof previousState === 'string' ? JSON.parse(previousState) : previousState || {};
  } catch (e) {
      prev = {};
  }
  
  try {
      next = typeof newState === 'string' ? JSON.parse(newState) : newState || {};
  } catch (e) {
      next = {};
  }

  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

  allKeys.forEach(key => {
    // Skip sensitive fields entirely
    const sensitive = ['password', 'passwordHash', 'token', 'secret', 'jwt', 'temporaryPassword', 'refreshToken', 'accessToken'];
    if (sensitive.includes(key)) return;

    const val1 = (prev as any)[key];
    const val2 = (next as any)[key];

    // Simple inequality check, works well enough for primitives and different strings
    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      changes.push({
        field: key,
        prev: val1,
        next: val2
      });
    }
  });

  return changes;
};

export const formatPermission = (perm: string): string => {
  return perm
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(' Read', ' — Read')
    .replace(' Write', ' — Write')
    .replace(' Delete', ' — Delete')
    .replace(' Create', ' — Create')
    .replace(' Self', ' — Self');
};
