export type ClientType = 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT' | 'NON_PROFIT' | 'OTHER';

export interface ClientContact {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  primary: boolean;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  registrationNumber: string | null;
  industry: string | null;
  address: string | null;
  clientType: ClientType;
  active: boolean;
  contacts: ClientContact[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  email?: string;
  phone?: string;
  registrationNumber?: string;
  industry?: string;
  address?: string;
  clientType: ClientType;
}

export interface ClientContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  primary: boolean;
}

export interface DuplicateClientCheckResponse {
  hasConflict: boolean;
  hasWarning: boolean;
  message: string;
  field: string | null;
}
