'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Legacy support: if sessionStorage has formData, create inquiry and redirect
    const stored = sessionStorage.getItem('caseFinderFormData');
    const existingId = sessionStorage.getItem('caseFinderInquiryId');

    if (existingId) {
      // Already has an inquiry — redirect to it
      sessionStorage.removeItem('caseFinderFormData');
      sessionStorage.removeItem('caseFinderInquiryId');
      router.replace(`/results/${existingId}`);
      return;
    }

    if (stored) {
      const data = JSON.parse(stored);
      fetch('/api/inquiries', {
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
          shownCaseIds: [],
        }),
      })
        .then((res) => res.json())
        .then((inquiry) => {
          sessionStorage.removeItem('caseFinderFormData');
          router.replace(`/results/${inquiry.id}`);
        })
        .catch(() => {
          router.replace('/');
        });
      return;
    }

    // No data at all — go back to form
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  );
}
