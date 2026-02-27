'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FormData, DifyCaseStudy, ChatMessage, JOB_CATEGORIES, INDUSTRIES } from '@/types';
import { CaseCard } from '@/components/cases/CaseCard';
import { AIComment } from '@/components/ai/AIComment';

interface InquiryData extends FormData {
  id: string;
  generatedCases: DifyCaseStudy[] | null;
  initialComment: string | null;
  chatMessages: ChatMessage[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Streaming state
  const [streamingText, setStreamingText] = useState('');
  const [cases, setCases] = useState<DifyCaseStudy[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamStartedRef = useRef(false);
  const startStreamingRef = useRef<((data: FormData) => Promise<void>) | undefined>(undefined);

  // Initial comment state (for saving to DB after fetch)
  const [resolvedInitialComment, setResolvedInitialComment] = useState<string | null>(null);

  // Pagination state
  const CASES_PER_PAGE = 2;
  const MAX_LOAD_MORE_CLICKS = 3;
  const [visibleCount, setVisibleCount] = useState(CASES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetchingFromDify, setIsFetchingFromDify] = useState(false);
  const [loadMoreCount, setLoadMoreCount] = useState(0);

  // Parse Dify SSE stream and return parsed cases
  const fetchDifyCases = useCallback(async (data: FormData): Promise<DifyCaseStudy[]> => {
    const jcLabel =
      JOB_CATEGORIES.find((c) => c.value === data.jobCategory)?.label ||
      data.jobCategoryOther ||
      data.jobCategory;
    const indLabel =
      INDUSTRIES.find((i) => i.value === data.industry)?.label ||
      data.industryOther ||
      data.industry;

    const response = await fetch('/api/ai/dify-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        industry: indLabel,
        job_category: jcLabel,
        detail: data.consultationContent || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result: DifyCaseStudy[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6).trim();
        if (!dataStr) continue;

        try {
          const event = JSON.parse(dataStr);

          if (event.event === 'text_chunk') {
            const chunk = event.data?.text || '';
            setStreamingText((prev) => prev + chunk);
          } else if (event.event === 'workflow_finished') {
            const outputs = event.data?.outputs;
            if (outputs) {
              const source = outputs.structured_output || outputs;
              if (source.cases && Array.isArray(source.cases)) {
                result = source.cases;
              } else if (typeof source === 'string') {
                try {
                  const obj = JSON.parse(source);
                  result = obj.cases || [];
                } catch {
                  // ignore parse error
                }
              }
            }
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    return result;
  }, []);

  // Save generatedCases and/or initialComment to DB
  const patchInquiry = useCallback(async (updates: { generatedCases?: DifyCaseStudy[]; initialComment?: string }) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to patch inquiry:', err);
    }
  }, [id]);

  // Start initial Dify streaming (first visit only)
  const startStreaming = useCallback(async (data: FormData) => {
    if (streamStartedRef.current) return;
    streamStartedRef.current = true;
    setIsStreaming(true);

    try {
      const parsed = await fetchDifyCases(data);
      setCases(parsed);
      setIsComplete(true);
      setIsStreaming(false);

      // Save to DB
      patchInquiry({ generatedCases: parsed });
    } catch (err) {
      console.error('Dify streaming error:', err);
      setError('事例の生成中にエラーが発生しました。ページを再読み込みしてください。');
      setIsStreaming(false);
    }
  }, [fetchDifyCases, patchInquiry]);

  // Keep ref in sync so useEffect doesn't depend on startStreaming directly
  startStreamingRef.current = startStreaming;

  // Fetch inquiry data on mount
  useEffect(() => {
    async function loadInquiry() {
      try {
        const res = await fetch(`/api/inquiries/${id}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data: InquiryData = await res.json();
        setInquiry(data);

        if (data.generatedCases && data.generatedCases.length > 0) {
          // Revisit: use cached cases
          setCases(data.generatedCases);
          setIsComplete(true);
          setResolvedInitialComment(data.initialComment);
        } else {
          // First visit: stream cases from Dify
          startStreamingRef.current?.(data);
        }

        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    }
    loadInquiry();
  }, [id]);

  // Load more cases
  const handleLoadMore = useCallback(async () => {
    if (!inquiry || isLoadingMore) return;
    setIsLoadingMore(true);
    setStreamingText('');

    const nextVisibleCount = visibleCount + CASES_PER_PAGE;

    try {
      if (cases.length >= nextVisibleCount) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        setIsFetchingFromDify(true);
        const moreCases = await fetchDifyCases(inquiry);
        const updatedCases = [...cases, ...moreCases];
        setCases(updatedCases);
        // Save all cases to DB
        patchInquiry({ generatedCases: updatedCases });
      }
      setVisibleCount(nextVisibleCount);
      setLoadMoreCount((prev) => prev + 1);
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setIsLoadingMore(false);
      setIsFetchingFromDify(false);
    }
  }, [inquiry, isLoadingMore, visibleCount, cases, fetchDifyCases, patchInquiry]);

  // Callback for AIComment to report its resolved initial comment so we can save it
  const handleInitialCommentResolved = useCallback((comment: string) => {
    setResolvedInitialComment(comment);
    patchInquiry({ initialComment: comment });
  }, [patchInquiry]);

  if (loading) {
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
          <p className="text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (notFound || !inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">お探しのページが見つかりませんでした。</p>
          <button
            onClick={() => router.push('/')}
            className="text-primary hover:text-primary-dark underline"
          >
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  const jobCategoryLabel =
    JOB_CATEGORIES.find((c) => c.value === inquiry.jobCategory)?.label ||
    inquiry.jobCategoryOther ||
    '';
  const industryLabel =
    INDUSTRIES.find((i) => i.value === inquiry.industry)?.label ||
    inquiry.industryOther ||
    '';

  const visibleCases = cases.slice(0, visibleCount);

  const handleScheduleMeeting = () => {
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
            {inquiry.companyUrl && (
              <div className="col-span-2">
                <span className="text-gray-500">会社URL：</span>
                <span className="text-gray-900 ml-1">{inquiry.companyUrl}</span>
              </div>
            )}
            {inquiry.consultationContent && (
              <div className="col-span-2">
                <span className="text-gray-500">相談内容：</span>
                <span className="text-gray-900 ml-1">{inquiry.consultationContent}</span>
              </div>
            )}
          </div>
        </section>

        {/* AI Comment / Chat Widget */}
        <AIComment
          jobCategory={inquiry.jobCategory}
          industry={inquiry.industry}
          consultationContent={inquiry.consultationContent}
          inquiryId={inquiry.id}
          displayedCases={visibleCases}
          initialComment={resolvedInitialComment}
          existingChatMessages={inquiry.chatMessages}
          onInitialCommentResolved={handleInitialCommentResolved}
        />

        {/* Streaming Text / Cases Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">近い事例</h2>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-primary hover:text-primary-dark underline"
              >
                再読み込み
              </button>
            </div>
          ) : isComplete && cases.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {visibleCases.map((caseStudy, idx) => (
                  <CaseCard key={idx} caseStudy={caseStudy} />
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
                    {isFetchingFromDify && (
                      <p className="text-xs text-gray-400 mt-1">AIが事例紹介文を生成中です..</p>
                    )}
                  </div>
                ) : loadMoreCount < MAX_LOAD_MORE_CLICKS ? (
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
            </>
          ) : (
            /* Show streaming text while generating */
            <div className="bg-white rounded-xl shadow-sm p-6">
              {streamingText ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{streamingText}</p>
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    御社に最適な事例を生成しています...
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bottom CTA Section */}
        {isComplete && (
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
        )}
      </div>
    </div>
  );
}
