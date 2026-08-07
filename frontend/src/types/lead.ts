export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'CLOSED_WON' | 'CLOSED_LOST';

export type InquirySource = 'WEBSITE' | 'REFERRAL' | 'COLD_CALL' | 'EVENT' | 'OTHER';

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'SYSTEM_EVENT';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Lead {
  id: string;
  clientId: string;
  clientName: string;
  contactId?: string;
  contactName?: string;
  title: string;
  inquirySource: InquirySource;
  interestedProduct: string | null;
  initialRequest: string | null;
  status: LeadStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRequest {
  clientId: string;
  contactId?: string;
  title: string;
  inquirySource: InquirySource;
  interestedProduct?: string;
  initialRequest?: string;
  status: LeadStatus;
  notes?: string;
  initialMeetingAt?: string; // ISO timestamp for Phase 5 brief deadline
}

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: ActivityType;
  description: string;
  activityDate: string;
  createdBy: string;
  createdAt: string;
}

export interface LeadActivityRequest {
  activityType: ActivityType;
  description: string;
  activityDate: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  followUpDate: string;
  status: FollowUpStatus;
  notes: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  leadTitle?: string;
}

export interface FollowUpRequest {
  followUpDate: string;
  status: FollowUpStatus;
  notes?: string;
  assignedTo?: string;
}
