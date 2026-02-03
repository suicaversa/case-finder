export interface AICommentParams {
  jobCategory: string;
  industry: string;
  consultationContent?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  accounting: '経理・会計業務',
  hr: '人事・労務関連の業務',
  'sales-admin': '営業事務',
  'customer-support': 'カスタマーサポート業務',
  it: 'IT・情シス関連の業務',
  marketing: 'マーケティング支援',
  other: 'バックオフィス業務',
};

const INDUSTRY_LABELS: Record<string, string> = {
  'it-web': 'IT・Web業界',
  'ec-retail': 'EC・小売業界',
  manufacturing: '製造業',
  service: 'サービス業',
  'real-estate': '不動産業界',
  healthcare: '医療・介護業界',
  education: '教育業界',
  other: '御社の業界',
};

export const getCategoryLabel = (value: string) =>
  CATEGORY_LABELS[value] || 'バックオフィス業務';
export const getIndustryLabel = (value: string) =>
  INDUSTRY_LABELS[value] || '御社の業界';

// Mock AI response generator shared across UI surfaces
export function generateAIComment(props: AICommentParams): string {
  const { jobCategory, industry, consultationContent } = props;

  const catMsg = getCategoryLabel(jobCategory);
  const indMsg = getIndustryLabel(industry);

  let message = `${indMsg}で${catMsg}のご相談ですね！\n\n`;
  message += `HELPYOUでは、${indMsg}のお客様を多数サポートさせていただいております。`;
  message += `${catMsg}については、専門知識を持ったスタッフがチームで対応いたしますので、安心してお任せいただけます。\n\n`;

  if (consultationContent) {
    message += `「${consultationContent}」というご相談内容についても、似たようなケースの実績がございます。\n\n`;
  }

  message += `以下に、御社に近い事例をピックアップしましたので、ぜひご覧ください！`;

  return message;
}
