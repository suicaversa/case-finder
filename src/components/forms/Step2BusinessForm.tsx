'use client';

import { BusinessInfo, JOB_CATEGORIES, INDUSTRIES } from '@/types';

interface Props {
  data: BusinessInfo;
  onChange: (data: BusinessInfo) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function Step2BusinessForm({ data, onChange, onBack, onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isValid =
    data.jobCategory &&
    data.industry &&
    (data.noCompanyUrl || data.companyUrl.trim()) &&
    (data.jobCategory !== 'other' || data.jobCategoryOther?.trim()) &&
    (data.industry !== 'other' || data.industryOther?.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name (optional) */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          会社名（任意）
        </label>
        <input
          type="text"
          id="companyName"
          value={data.companyName || ''}
          onChange={(e) => onChange({ ...data, companyName: e.target.value })}
          placeholder="株式会社〇〇"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Company URL */}
      <div>
        <label htmlFor="companyUrl" className="block text-sm font-medium text-gray-700 mb-1">
          会社URL {!data.noCompanyUrl && <span className="text-red-500">*</span>}
        </label>
        <input
          type="url"
          id="companyUrl"
          value={data.companyUrl}
          onChange={(e) => onChange({ ...data, companyUrl: e.target.value })}
          placeholder="https://example.co.jp"
          disabled={data.noCompanyUrl}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
        />
        <label className="flex items-center mt-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={data.noCompanyUrl}
            onChange={(e) => onChange({ ...data, noCompanyUrl: e.target.checked, companyUrl: '' })}
            className="mr-2"
          />
          会社サイトがないため入力を省略する
        </label>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          業界 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.value}
              type="button"
              onClick={() => onChange({ ...data, industry: ind.value })}
              className={`p-3 text-sm border rounded-lg transition-colors ${
                data.industry === ind.value
                  ? 'border-primary bg-red-50 text-primary'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
        {data.industry === 'other' && (
          <input
            type="text"
            value={data.industryOther || ''}
            onChange={(e) => onChange({ ...data, industryOther: e.target.value })}
            placeholder="業界を入力してください"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        )}
      </div>

      {/* Job Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          お困りの業務の種類 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChange({ ...data, jobCategory: cat.value })}
              className={`p-3 text-sm border rounded-lg transition-colors ${
                data.jobCategory === cat.value
                  ? 'border-primary bg-red-50 text-primary'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {data.jobCategory === 'other' && (
          <input
            type="text"
            value={data.jobCategoryOther || ''}
            onChange={(e) => onChange({ ...data, jobCategoryOther: e.target.value })}
            placeholder="業務内容を入力してください"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        )}
      </div>

      {/* Consultation Content (optional) */}
      <div>
        <label htmlFor="consultation" className="block text-sm font-medium text-gray-700 mb-1">
          相談内容（任意）
        </label>
        <textarea
          id="consultation"
          value={data.consultationContent || ''}
          onChange={(e) => onChange({ ...data, consultationContent: e.target.value })}
          placeholder="例：経理業務の一部をアウトソースしたい、採用事務を手伝ってほしい など"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          戻る
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          事例を見る
        </button>
      </div>
    </form>
  );
}
