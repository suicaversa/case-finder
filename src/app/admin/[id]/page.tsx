'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { JOB_CATEGORIES, INDUSTRIES, InquiryStatus, Inquiry } from '@/types';
import { generateAIComment } from '@/lib/aiComment';

const statusColors: Record<InquiryStatus, string> = {
  '未対応': 'bg-red-100 text-red-800 border-red-200',
  '対応中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '対応済み': 'bg-green-100 text-green-800 border-green-200',
};

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<InquiryStatus>('未対応');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchInquiry = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/inquiries/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('問い合わせが見つかりません。');
        } else {
          throw new Error(`API error: ${res.status}`);
        }
        return;
      }
      const data: Inquiry = await res.json();
      setInquiry(data);
      setStatus(data.status);
      setNotes(data.notes || '');
    } catch (err) {
      console.error('Failed to fetch inquiry:', err);
      setError('問い合わせデータの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInquiry();
  }, [fetchInquiry]);

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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const updated: Inquiry = await res.json();
      setInquiry(updated);
      setSaveMessage('保存しました');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Error state / Not found
  if (error || !inquiry) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || '問い合わせが見つかりません'}</p>
          <Link href="/admin" className="text-primary hover:underline">
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            チャット履歴 ({chatMessages.length > 0 ? `${chatMessages.length}件のメッセージ` : 'メッセージなし'})
          </h2>
          {fullChatMessages.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-500">チャット履歴はありません。</p>
          )}
        </div>

        {/* Shown Cases */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">紹介された事例</h2>
          <p className="text-sm text-gray-500">
            事例はAIによって動的に生成されています。チャット履歴から表示内容を確認できます。
          </p>
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
        <div className="flex items-center justify-end gap-4">
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {saveMessage}
            </span>
          )}
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
