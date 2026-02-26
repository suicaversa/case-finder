'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, JOB_CATEGORIES, INDUSTRIES } from '@/types';
import { CaseCard } from '@/components/cases/CaseCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AIComment } from '@/components/ai/AIComment';
import { findMatchingCases } from '@/data/mockCases';

const CASES_PER_PAGE = 2;
const MAX_LOAD_MORE_CLICKS = 3;

export default function ResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const inquiryCreatedRef = useRef(false);

  // Create inquiry in DB when form data is loaded
  const createInquiry = useCallback(async (data: FormData, shownCaseIds: string[]) => {
    // Prevent duplicate creation
    if (inquiryCreatedRef.current) return;
    inquiryCreatedRef.current = true;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          companyUrl: data.companyUrl,
          jobCategory: data.jobCategory,
          jobCategoryOther: data.jobCategoryOther,
          industry: data.industry,
          industryOther: data.industryOther,
          consultationContent: data.consultationContent,
          shownCaseIds,
        }),
      });

      if (!res.ok) {
        console.error('Failed to create inquiry:', res.status);
        inquiryCreatedRef.current = false;
        return;
      }

      const inquiry = await res.json();
      setInquiryId(inquiry.id);

      // Store the inquiryId in sessionStorage for reference
      sessionStorage.setItem('caseFinderInquiryId', inquiry.id);
    } catch (err) {
      console.error('Failed to create inquiry:', err);
      inquiryCreatedRef.current = false;
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('caseFinderFormData');
    // Check if an inquiry was already created for this session
    const existingInquiryId = sessionStorage.getItem('caseFinderInquiryId');

    if (stored) {
      const parsedData: FormData = JSON.parse(stored);
      setFormData(parsedData);

      if (existingInquiryId) {
        // Reuse existing inquiry ID (e.g. user navigated back and forward)
        setInquiryId(existingInquiryId);
        inquiryCreatedRef.current = true;
      } else {
        // Get the case IDs that will be shown initially
        const matchingCases = findMatchingCases(parsedData.jobCategory, parsedData.industry);
        const initialCaseIds = matchingCases.slice(0, CASES_PER_PAGE).map((c) => c.id);
        createInquiry(parsedData, initialCaseIds);
      }

      // Simulate AI generation time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      router.push('/');
    }
  }, [router, createInquiry]);

  // Update shownCaseIds when user loads more cases
  const updateShownCaseIds = useCallback(async (caseIds: string[]) => {
    if (!inquiryId) return;
    try {
      await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shownCaseIds: caseIds }),
      });
    } catch (err) {
      console.error('Failed to update shownCaseIds:', err);
    }
  }, [inquiryId]);

  if (!formData || isLoading) {
    return <LoadingScreen />;
  }

  const allMatchingCases = findMatchingCases(formData.jobCategory, formData.industry);
  const visibleCasesCount = CASES_PER_PAGE + loadMoreCount * CASES_PER_PAGE;
  const visibleCases = allMatchingCases.slice(0, visibleCasesCount);
  const hasMoreCases = visibleCasesCount < allMatchingCases.length;
  const reachedMaxLoads = loadMoreCount >= MAX_LOAD_MORE_CLICKS;

  const jobCategoryLabel =
    JOB_CATEGORIES.find((c) => c.value === formData.jobCategory)?.label ||
    formData.jobCategoryOther ||
    '';
  const industryLabel =
    INDUSTRIES.find((i) => i.value === formData.industry)?.label ||
    formData.industryOther ||
    '';

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const newCount = loadMoreCount + 1;
      setLoadMoreCount(newCount);
      setIsLoadingMore(false);

      // Update the shown case IDs in DB
      const newVisibleCount = CASES_PER_PAGE + newCount * CASES_PER_PAGE;
      const newCaseIds = allMatchingCases.slice(0, newVisibleCount).map((c) => c.id);
      updateShownCaseIds(newCaseIds);
    }, 1500);
  };

  const handleScheduleMeeting = () => {
    // Mock: In production, this would link to a scheduling service
    alert('外部のスケジュール調整サービスに遷移します（モック）');
  };

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
              className="text-sm text-primary hover:text-primary-dark"
            >
              修正する
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">お困りの業務：</span>
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

        {/* AI Comment Section */}
        <AIComment
          jobCategory={formData.jobCategory}
          industry={formData.industry}
          consultationContent={formData.consultationContent}
          inquiryId={inquiryId}
        />

        {/* Case Studies Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">近い事例</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {visibleCases.map((caseStudy) => (
              <CaseCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                jobCategory={formData.jobCategory}
                industry={formData.industry}
                consultationContent={formData.consultationContent}
              />
            ))}
          </div>

          {/* Load More / Schedule Button */}
          <div className="mt-8 text-center">
            {isLoadingMore ? (
              <div className="py-4">
                <div className="flex justify-center gap-2 mb-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">事例を探しています...</p>
              </div>
            ) : !reachedMaxLoads && hasMoreCases ? (
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                更に事例を探す
              </button>
            ) : (
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  これ以上の事例は、営業担当から詳しくご説明させてください
                </p>
                <button
                  onClick={handleScheduleMeeting}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  営業担当と日程を調整する
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="bg-primary rounded-xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            この事例について詳しく聞きたい方へ
          </h2>
          <p className="mb-6 text-red-100">
            営業担当が御社の状況に合わせて、詳しくご説明いたします
          </p>
          <button
            onClick={handleScheduleMeeting}
            className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-red-50 transition-colors"
          >
            打ち合わせ日程を調整する
          </button>
        </section>
      </div>
    </div>
  );
}
