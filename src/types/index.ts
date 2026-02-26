// Form data types
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessInfo {
  jobCategory: string;
  jobCategoryOther?: string;
  industry: string;
  industryOther?: string;
  companyUrl?: string;
  companyName?: string;
  consultationContent?: string;
}

export interface FormData extends ContactInfo, BusinessInfo {}

// Admin types
export type InquiryStatus = '未対応' | '対応中' | '対応済み';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Inquiry extends FormData {
  id: string;
  createdAt: string;
  status: InquiryStatus;
  shownCaseIds: string[];
  notes: string;
  chatMessages: ChatMessage[];
}

// Case study types
export interface CaseStudy {
  id: string;
  title: string;
  background: string;
  requestedContent: string;
  actualServices: string;
  contractPlan: string;
  imageUrl: string;
  jobCategories: string[];
  industries: string[];
}

// Dify API case study type
export interface DifyCaseStudy {
  title: string;
  background: string;
  requestedContent: string;
  actualServices: string[];
}

// Constants
export const JOB_CATEGORIES = [
  { value: 'accounting', label: '経理・会計' },
  { value: 'hr', label: '人事・労務' },
  { value: 'sales-admin', label: '営業事務' },
  { value: 'customer-support', label: 'カスタマーサポート' },
  { value: 'it', label: 'IT / 情シス' },
  { value: 'marketing', label: 'マーケティング支援' },
  { value: 'other', label: 'その他' },
] as const;

export const INDUSTRIES = [
  { value: 'it-web', label: 'IT / Web' },
  { value: 'ec-retail', label: 'EC / 小売' },
  { value: 'manufacturing', label: '製造' },
  { value: 'service', label: 'サービス' },
  { value: 'real-estate', label: '不動産' },
  { value: 'healthcare', label: '医療・介護' },
  { value: 'education', label: '教育' },
  { value: 'other', label: 'その他' },
] as const;
