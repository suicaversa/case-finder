'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContactInfo, BusinessInfo, FormData } from '@/types';
import { Step1BusinessForm } from '@/components/forms/Step1ContactForm';
import { Step2ContactForm } from '@/components/forms/Step2BusinessForm';
import { StepIndicator } from '@/components/forms/StepIndicator';

const emptyContactInfo: ContactInfo = {
  name: '',
  email: '',
  phone: '',
};

const emptyBusinessInfo: BusinessInfo = {
  jobCategory: '',
  industry: '',
  companyUrl: '',
  companyName: '',
  consultationContent: '',
};

const debugContactInfo: ContactInfo = {
  name: 'やまだ たろう',
  email: 'yamada@example.co.jp',
  phone: '03-1234-5678',
};

const debugBusinessInfo: BusinessInfo = {
  jobCategory: 'accounting',
  industry: 'it-web',
  companyUrl: 'https://example.co.jp',
  companyName: '株式会社サンプル',
  consultationContent: '経理業務の一部をアウトソースしたいと考えています。',
};

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDebug = searchParams.get('debug') === 'true';

  const [step, setStep] = useState<1 | 2>(1);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(isDebug ? debugContactInfo : emptyContactInfo);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(isDebug ? debugBusinessInfo : emptyBusinessInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasUnsavedChanges = useCallback(() => {
    const businessChanged =
      businessInfo.jobCategory !== '' ||
      businessInfo.industry !== '';
    const contactChanged =
      contactInfo.name !== '' ||
      contactInfo.email !== '' ||
      contactInfo.phone !== '';
    return businessChanged || contactChanged;
  }, [contactInfo, businessInfo]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData: FormData = { ...contactInfo, ...businessInfo };
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          companyUrl: formData.companyUrl,
          jobCategory: formData.jobCategory,
          jobCategoryOther: formData.jobCategoryOther,
          industry: formData.industry,
          industryOther: formData.industryOther,
          consultationContent: formData.consultationContent,
          shownCaseIds: [],
        }),
      });
      if (!res.ok) throw new Error('Failed to create inquiry');
      const inquiry = await res.json();
      router.push(`/results/${inquiry.id}`);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            あなたに近い事例を見つける
          </h1>
          <p className="text-gray-600">
            簡単な入力で、御社に近い導入事例をご紹介します
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {step === 1 ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                ご相談内容を教えてください
              </h2>
              <Step1BusinessForm
                data={businessInfo}
                onChange={setBusinessInfo}
                onNext={() => setStep(2)}
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                お客様情報を入力してください
              </h2>
              <Step2ContactForm
                contactData={contactInfo}
                businessData={businessInfo}
                onContactChange={setContactInfo}
                onBusinessChange={setBusinessInfo}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          入力いただいた情報は、事例紹介およびご連絡のために使用いたします
        </p>
      </div>
    </div>
  );
}
