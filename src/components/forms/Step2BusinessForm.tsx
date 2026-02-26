'use client';

import { useState, useCallback } from 'react';
import { ContactInfo, BusinessInfo } from '@/types';

interface Props {
  contactData: ContactInfo;
  businessData: BusinessInfo;
  onContactChange: (data: ContactInfo) => void;
  onBusinessChange: (data: BusinessInfo) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return '正しいメールアドレスの形式で入力してください';
  return null;
}

function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null;
  const digits = phone.replace(/-/g, '');
  if (!/^\d+$/.test(digits)) return '数字とハイフンのみで入力してください';
  if (digits.length < 10 || digits.length > 11) return '電話番号は10〜11桁で入力してください';
  return null;
}

function validateName(name: string): string | null {
  if (!name.trim()) return null;
  const nameRegex = /^[\u3040-\u309F\u30A0-\u30FF\u3000\s・ー]+$/;
  if (!nameRegex.test(name.trim())) return 'ひらがな または カタカナで入力してください';
  return null;
}

function validateUrl(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'https:// から始まるURLを入力してください';
    }
    return null;
  } catch {
    return '正しいURL形式で入力してください（例: https://example.co.jp）';
  }
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length === 0) return '';

  if (digits.startsWith('0')) {
    if (digits.length <= 3) return digits;
    if (digits.startsWith('03') || digits.startsWith('06')) {
      if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.startsWith('0120') || digits.startsWith('0800')) {
      if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 10)}`;
    }
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  return digits;
}

type TouchedFields = {
  name: boolean;
  email: boolean;
  phone: boolean;
  companyUrl: boolean;
};

export function Step2ContactForm({ contactData, businessData, onContactChange, onBusinessChange, onBack, onSubmit, isSubmitting = false }: Props) {
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    phone: false,
    companyUrl: false,
  });

  const handleBlur = useCallback((field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onContactChange({ ...contactData, phone: formatted });
    },
    [contactData, onContactChange]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, companyUrl: true });
    if (isValid && !hasErrors) {
      onSubmit();
    }
  };

  const nameError = touched.name ? validateName(contactData.name) : null;
  const emailError = touched.email ? validateEmail(contactData.email) : null;
  const phoneError = touched.phone ? validatePhone(contactData.phone) : null;
  const urlError = touched.companyUrl ? validateUrl(businessData.companyUrl || '') : null;

  const isNameComplete = contactData.name.trim().length > 0 && !validateName(contactData.name);
  const isEmailComplete = contactData.email.trim().length > 0 && !validateEmail(contactData.email);
  const isPhoneComplete = contactData.phone.trim().length > 0 && !validatePhone(contactData.phone);

  const isCompanyNameComplete = (businessData.companyName || '').trim().length > 0;

  const isValid = contactData.name.trim() && contactData.email.trim() && contactData.phone.trim() && isCompanyNameComplete;
  const hasErrors = !!nameError || !!emailError || !!phoneError || !!urlError;

  const completedCount = [isNameComplete, isEmailComplete, isPhoneComplete, isCompanyNameComplete].filter(Boolean).length;
  const completionRate = Math.round((completedCount / 4) * 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          担当者名 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">（必須）</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            value={contactData.name}
            onChange={(e) => onContactChange({ ...contactData, name: e.target.value })}
            onBlur={() => handleBlur('name')}
            placeholder="やまだ たろう"
            aria-required="true"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'name-error' : 'name-hint'}
            className={`w-full px-4 py-3 pr-10 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-transparent ${
              nameError
                ? 'border-red-500 bg-red-50'
                : isNameComplete
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
            }`}
            required
          />
          {isNameComplete && !nameError && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-200" aria-hidden="true">
              &#10003;
            </span>
          )}
        </div>
        {nameError ? (
          <p id="name-error" className="mt-1 text-xs text-red-600 transition-all duration-200" role="alert">
            {nameError}
          </p>
        ) : (
          <p id="name-hint" className="mt-1 text-xs text-gray-500">ひらがな または カタカナでご入力ください</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">（必須）</span>
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            value={contactData.email}
            onChange={(e) => onContactChange({ ...contactData, email: e.target.value })}
            onBlur={() => handleBlur('email')}
            placeholder="example@company.co.jp"
            aria-required="true"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={`w-full px-4 py-3 pr-10 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-transparent ${
              emailError
                ? 'border-red-500 bg-red-50'
                : isEmailComplete
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
            }`}
            required
          />
          {isEmailComplete && !emailError && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-200" aria-hidden="true">
              &#10003;
            </span>
          )}
        </div>
        {emailError && (
          <p id="email-error" className="mt-1 text-xs text-red-600 transition-all duration-200" role="alert">
            {emailError}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">（必須）</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            value={contactData.phone}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur('phone')}
            placeholder="03-1234-5678"
            aria-required="true"
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? 'phone-error' : 'phone-hint'}
            className={`w-full px-4 py-3 pr-10 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-transparent ${
              phoneError
                ? 'border-red-500 bg-red-50'
                : isPhoneComplete
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
            }`}
            required
          />
          {isPhoneComplete && !phoneError && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-200" aria-hidden="true">
              &#10003;
            </span>
          )}
        </div>
        {phoneError ? (
          <p id="phone-error" className="mt-1 text-xs text-red-600 transition-all duration-200" role="alert">
            {phoneError}
          </p>
        ) : (
          <p id="phone-hint" className="mt-1 text-xs text-gray-500">
            内容を整理した結果をもとに、担当者からご連絡する場合があります
          </p>
        )}
      </div>

      {/* Company Name (optional) */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          会社名 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">（必須）</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="companyName"
            value={businessData.companyName || ''}
            onChange={(e) => onBusinessChange({ ...businessData, companyName: e.target.value })}
            placeholder="株式会社〇〇"
            aria-required="true"
            className={`w-full px-4 py-3 pr-10 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-transparent ${
              isCompanyNameComplete ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            required
          />
          {isCompanyNameComplete && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-200" aria-hidden="true">
              &#10003;
            </span>
          )}
        </div>
      </div>

      {/* Company URL (optional) */}
      <div>
        <label htmlFor="companyUrl" className="block text-sm font-medium text-gray-700 mb-1">
          会社URL（任意）
        </label>
        <input
          type="url"
          id="companyUrl"
          value={businessData.companyUrl || ''}
          onChange={(e) => onBusinessChange({ ...businessData, companyUrl: e.target.value })}
          onBlur={() => handleBlur('companyUrl')}
          placeholder="https://example.co.jp"
          aria-invalid={!!urlError}
          aria-describedby={urlError ? 'url-error' : undefined}
          className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-transparent ${
            urlError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {urlError && (
          <p id="url-error" className="mt-1 text-xs text-red-600 transition-all duration-200" role="alert">
            {urlError}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          aria-label="前のステップに戻る"
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
        >
          戻る
        </button>
        <button
          type="submit"
          disabled={!isValid || hasErrors || isSubmitting}
          aria-label="事例を見る"
          className="flex-1 py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              送信中...
            </span>
          ) : (
            '事例を見る'
          )}
        </button>
      </div>
    </form>
  );
}
