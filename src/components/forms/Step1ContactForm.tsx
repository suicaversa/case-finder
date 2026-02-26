'use client';

import { useState } from 'react';
import { BusinessInfo, JOB_CATEGORIES, INDUSTRIES } from '@/types';

interface Props {
  data: BusinessInfo;
  onChange: (data: BusinessInfo) => void;
  onNext: () => void;
}

const MAX_CONSULTATION_LENGTH = 500;

export function Step1BusinessForm({ data, onChange, onNext }: Props) {
  const [showOtherErrors, setShowOtherErrors] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtherErrors(true);
    if (isValid) {
      onNext();
    }
  };

  const isValid =
    !!data.industry &&
    !!data.jobCategory &&
    (data.industry !== 'other' || !!data.industryOther?.trim()) &&
    (data.jobCategory !== 'other' || !!data.jobCategoryOther?.trim());

  const isIndustryComplete = !!data.industry && (data.industry !== 'other' || !!data.industryOther?.trim());
  const isJobCategoryComplete = !!data.jobCategory && (data.jobCategory !== 'other' || !!data.jobCategoryOther?.trim());

  const completedCount = [isIndustryComplete, isJobCategoryComplete].filter(Boolean).length;
  const completionRate = Math.round((completedCount / 2) * 100);

  const consultationLength = data.consultationContent?.length || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* AI message */}
      <div className="flex items-start gap-3 bg-red-50 rounded-lg p-4">
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          入力いただいた内容をもとに、<strong className="text-primary">AIが御社に近い参考事例</strong>をお探しします。
        </p>
      </div>

      {/* Completion progress */}
      <div className="mb-2" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={`入力完了率 ${completionRate}%`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">入力完了率</span>
          <span className="text-xs font-medium text-gray-700">{completionRate}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Industry */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          業界 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">（必須）</span>
        </legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="業界を選択">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.value}
              type="button"
              role="radio"
              aria-checked={data.industry === ind.value}
              onClick={() => onChange({ ...data, industry: ind.value })}
              className={`p-3 text-sm border rounded-lg transition-colors duration-200 ${
                data.industry === ind.value
                  ? 'border-primary bg-red-50 text-primary font-medium'
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
            aria-label="その他の業界"
            aria-required="true"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
          />
        )}
        {showOtherErrors && data.industry === 'other' && !data.industryOther?.trim() && (
          <p className="mt-1 text-xs text-red-600" role="alert">業界を入力してください</p>
        )}
      </fieldset>

      {/* Job Category */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          お困りの業務の種類 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">（必須）</span>
        </legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="業務の種類を選択">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="radio"
              aria-checked={data.jobCategory === cat.value}
              onClick={() => onChange({ ...data, jobCategory: cat.value })}
              className={`p-3 text-sm border rounded-lg transition-colors duration-200 ${
                data.jobCategory === cat.value
                  ? 'border-primary bg-red-50 text-primary font-medium'
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
            aria-label="その他の業務内容"
            aria-required="true"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
          />
        )}
        {showOtherErrors && data.jobCategory === 'other' && !data.jobCategoryOther?.trim() && (
          <p className="mt-1 text-xs text-red-600" role="alert">業務内容を入力してください</p>
        )}
      </fieldset>

      {/* Consultation Content */}
      <div>
        <label htmlFor="consultation" className="block text-sm font-medium text-gray-700 mb-1">
          相談内容（任意）
        </label>
        <textarea
          id="consultation"
          value={data.consultationContent || ''}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CONSULTATION_LENGTH) {
              onChange({ ...data, consultationContent: e.target.value });
            }
          }}
          placeholder="例：経理業務の一部をアウトソースしたい、採用事務を手伝ってほしい など"
          rows={3}
          maxLength={MAX_CONSULTATION_LENGTH}
          aria-label="相談内容"
          aria-describedby="consultation-counter"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
        />
        <div id="consultation-counter" className="flex justify-end mt-1">
          <span className={`text-xs ${consultationLength >= MAX_CONSULTATION_LENGTH ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
            {consultationLength} / {MAX_CONSULTATION_LENGTH}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        aria-label="次のステップへ進む"
        className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
      >
        次へ
      </button>
    </form>
  );
}
