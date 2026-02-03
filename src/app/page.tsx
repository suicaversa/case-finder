'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactInfo, BusinessInfo, FormData } from '@/types';
import { Step1ContactForm } from '@/components/forms/Step1ContactForm';
import { Step2BusinessForm } from '@/components/forms/Step2BusinessForm';
import { StepIndicator } from '@/components/forms/StepIndicator';

const initialContactInfo: ContactInfo = {
  name: '',
  email: '',
  phone: '',
};

const initialBusinessInfo: BusinessInfo = {
  jobCategory: '',
  industry: '',
  companyUrl: '',
  noCompanyUrl: false,
};

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(initialBusinessInfo);

  const handleSubmit = () => {
    const formData: FormData = { ...contactInfo, ...businessInfo };
    // Store in sessionStorage for the results page
    sessionStorage.setItem('caseFinderFormData', JSON.stringify(formData));
    router.push('/results');
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
                連絡先を入力してください
              </h2>
              <Step1ContactForm
                data={contactInfo}
                onChange={setContactInfo}
                onNext={() => setStep(2)}
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                業務・会社情報を入力してください
              </h2>
              <Step2BusinessForm
                data={businessInfo}
                onChange={setBusinessInfo}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
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
