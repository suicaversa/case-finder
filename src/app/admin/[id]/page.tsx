'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { mockInquiries } from '@/data/mockInquiries';
import { mockCases } from '@/data/mockCases';
import { JOB_CATEGORIES, INDUSTRIES, InquiryStatus } from '@/types';
import { generateAIComment } from '@/lib/aiComment';

const statusColors: Record<InquiryStatus, string> = {
  '未対応': 'bg-red-100 text-red-800 border-red-200',
  '対応中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '対応済み': 'bg-green-100 text-green-800 border-green-200',
};

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const inquiry = mockInquiries.find((inq) => inq.id === id);

  const [status, setStatus] = useState<InquiryStatus>(inquiry?.status || '未対応');
  const [notes, setNotes] = useState(inquiry?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">問い合わせが見つかりません</p>
          <Link href="/admin" className="text-primary hover:underline">
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getJobCategoryLabel = (value: string) =>
    JOB_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getIndustryLabel = (value: string) =>
    INDUSTRIES.find((i) => i.value === value)?.label || value;

  const shownCases = mockCases.filter((c) => inquiry.shownCaseIds.includes(c.id));
  const chatMessages = inquiry.chatMessages ?? [];
  const aiIntroMessage = generateAIComment({
    jobCategory: inquiry.jobCategory,
    industry: inquiry.industry,
    consultationContent: inquiry.consultationContent,
  });
  const fullChatMessages = [
    {
      id: `${inquiry.id}-intro`,
      role: 'assistant' as const,
      content: aiIntroMessage,
      createdAt: inquiry.createdAt,
    },
    ...chatMessages,
  ];

  const formatChatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Mock save - in production this would call an API
    setTimeout(() => {
      setIsSaving(false);
      alert('保存しました（モック）');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">問い合わせ詳細</h1>
          <span className="ml-auto text-sm text-gray-500">{inquiry.id}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status & Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対応ステータス
              </label>
              <div className="flex gap-2">
                {(['未対応', '対応中', '対応済み'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      status === s
                        ? statusColors[s]
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">受付日時</p>
              <p className="text-lg font-medium">{formatDate(inquiry.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">担当者名</p>
              <p className="text-gray-900">{inquiry.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">会社名</p>
              <p className="text-gray-900">{inquiry.companyName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">メールアドレス</p>
              <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline">
                {inquiry.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">電話番号</p>
              <a href={`tel:${inquiry.phone}`} className="text-primary hover:underline">
                {inquiry.phone}
              </a>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">会社URL</p>
              {inquiry.companyUrl ? (
                <a
                  href={inquiry.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {inquiry.companyUrl}
                </a>
              ) : (
                <p className="text-gray-400">-</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">業務情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">お困りの業務の種類</p>
              <p className="text-gray-900">{getJobCategoryLabel(inquiry.jobCategory)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">業界</p>
              <p className="text-gray-900">{getIndustryLabel(inquiry.industry)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">相談内容</p>
              <p className="text-gray-900">{inquiry.consultationContent || '-'}</p>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">チャット履歴</h2>
          <div className="space-y-3">
            {fullChatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      message.role === 'user' ? 'text-red-100' : 'text-gray-400'
                    }`}
                  >
                    {message.role === 'user' ? '利用者' : 'AI'}・{formatChatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shown Cases */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            紹介された事例 ({shownCases.length}件)
          </h2>
          <div className="space-y-4">
            {shownCases.map((c) => (
              <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={`/cases/case-${c.id}.png`}
                    alt={c.title}
                    className="w-full md:w-40 h-32 object-contain bg-white rounded"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="text-lg font-semibold text-gray-900">{c.title}</p>
                      <span className="inline-block px-3 py-1 bg-red-100 text-primary text-sm font-medium rounded-full">
                        {c.contractPlan}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">依頼された背景</p>
                      <p className="text-sm text-gray-600">{c.background}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">依頼内容</p>
                      <p className="text-sm text-gray-600">{c.requestedContent}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        HELPYOUが実際に行っている業務
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {c.actualServices}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">対応メモ</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="対応履歴や備考を入力..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>
      </main>
    </div>
  );
}
