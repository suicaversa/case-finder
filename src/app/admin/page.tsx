'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { JOB_CATEGORIES, INDUSTRIES, InquiryStatus, Inquiry } from '@/types';

const statusColors: Record<InquiryStatus, string> = {
  '未対応': 'bg-red-100 text-red-800',
  '対応中': 'bg-yellow-100 text-yellow-800',
  '対応済み': 'bg-green-100 text-green-800',
};

export default function AdminPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');

  const fetchInquiries = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/inquiries');
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setError('問い合わせデータの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const filteredInquiries = statusFilter === 'all'
    ? inquiries
    : inquiries.filter((inq) => inq.status === statusFilter);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">問い合わせ管理</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            ユーザー画面へ
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm text-gray-600">ステータス:</span>
          <div className="flex gap-2">
            {(['all', '未対応', '対応中', '対応済み'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'すべて' : status}
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm text-gray-500">
            {filteredInquiries.length}件
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
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
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchInquiries();
              }}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredInquiries.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              {statusFilter === 'all'
                ? '問い合わせがありません。'
                : `「${statusFilter}」の問い合わせはありません。`}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && filteredInquiries.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    受付日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    担当者名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    メールアドレス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    電話番号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    お困りの業務
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    業界
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inquiry.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inquiry.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inquiry.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getJobCategoryLabel(inquiry.jobCategory)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getIndustryLabel(inquiry.industry)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[inquiry.status]}`}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/${inquiry.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
