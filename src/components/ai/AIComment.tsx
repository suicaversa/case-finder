'use client';

interface Props {
  jobCategory: string;
  industry: string;
  consultationContent?: string;
}

// Mock AI response generator
function generateAIComment(props: Props): string {
  const { jobCategory, industry, consultationContent } = props;

  const categoryMessages: Record<string, string> = {
    accounting: '経理・会計業務',
    hr: '人事・労務関連の業務',
    'sales-admin': '営業事務',
    'customer-support': 'カスタマーサポート業務',
    it: 'IT・情シス関連の業務',
    marketing: 'マーケティング支援',
    other: 'バックオフィス業務',
  };

  const industryMessages: Record<string, string> = {
    'it-web': 'IT・Web業界',
    'ec-retail': 'EC・小売業界',
    manufacturing: '製造業',
    service: 'サービス業',
    'real-estate': '不動産業界',
    healthcare: '医療・介護業界',
    education: '教育業界',
    other: '御社の業界',
  };

  const catMsg = categoryMessages[jobCategory] || 'バックオフィス業務';
  const indMsg = industryMessages[industry] || '御社の業界';

  let message = `${indMsg}で${catMsg}のご相談ですね！\n\n`;
  message += `HELPYOUでは、${indMsg}のお客様を多数サポートさせていただいております。`;
  message += `${catMsg}については、専門知識を持ったスタッフがチームで対応いたしますので、安心してお任せいただけます。\n\n`;

  if (consultationContent) {
    message += `「${consultationContent}」というご相談内容についても、似たようなケースの実績がございます。\n\n`;
  }

  message += `以下に、御社に近い事例をピックアップしましたので、ぜひご覧ください！`;

  return message;
}

export function AIComment({ jobCategory, industry, consultationContent }: Props) {
  const comment = generateAIComment({ jobCategory, industry, consultationContent });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex gap-4">
        {/* Avatar placeholder - will be replaced with sales rep photo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">担当者</p>
        </div>

        {/* Speech bubble */}
        <div className="flex-1 relative">
          {/* Triangle pointer */}
          <div className="absolute left-0 top-4 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-blue-50" />

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{comment}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
