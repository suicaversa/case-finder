'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, JOB_CATEGORIES, INDUSTRIES } from '@/types';
import { CaseCard } from '@/components/cases/CaseCard';
import { findMatchingCases } from '@/data/mockCases';

export default function ResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('caseFinderFormData');
    if (stored) {
      setFormData(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const matchingCases = findMatchingCases(formData.jobCategory, formData.industry);
  const jobCategoryLabel =
    JOB_CATEGORIES.find((c) => c.value === formData.jobCategory)?.label ||
    formData.jobCategoryOther ||
    '';
  const industryLabel =
    INDUSTRIES.find((i) => i.value === formData.industry)?.label ||
    formData.industryOther ||
    '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            御社に近い事例をご紹介します
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Summary Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">入力内容</h2>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              修正する
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">業務カテゴリ：</span>
              <span className="text-gray-900 ml-1">{jobCategoryLabel}</span>
            </div>
            <div>
              <span className="text-gray-500">業界：</span>
              <span className="text-gray-900 ml-1">{industryLabel}</span>
            </div>
            {formData.companyUrl && (
              <div className="col-span-2">
                <span className="text-gray-500">会社URL：</span>
                <span className="text-gray-900 ml-1">{formData.companyUrl}</span>
              </div>
            )}
            {formData.consultationContent && (
              <div className="col-span-2">
                <span className="text-gray-500">相談内容：</span>
                <span className="text-gray-900 ml-1">{formData.consultationContent}</span>
              </div>
            )}
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            近い事例 ({matchingCases.length}件)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {matchingCases.map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            この事例について詳しく聞きたい方へ
          </h2>
          <p className="mb-6 text-blue-100">
            営業担当が御社の状況に合わせて、詳しくご説明いたします
          </p>
          <button
            onClick={() => {
              // Mock: In production, this would link to a scheduling service
              alert('外部のスケジュール調整サービスに遷移します（モック）');
            }}
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            打ち合わせ日程を調整する
          </button>
        </section>
      </div>
    </div>
  );
}
