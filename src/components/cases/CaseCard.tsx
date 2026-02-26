'use client';

import { useEffect, useState } from 'react';
import { CaseStudy } from '@/types';
import { ImageModal } from '@/components/ui/ImageModal';

interface GeneratedCaseText {
  title: string;
  background: string;
  requestedContent: string;
  actualServices: string;
  contractPlan: string;
}

interface Props {
  caseStudy: CaseStudy;
  jobCategory?: string;
  industry?: string;
  consultationContent?: string;
}

export function CaseCard({ caseStudy, jobCategory, industry, consultationContent }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedText, setGeneratedText] = useState<GeneratedCaseText | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Fallback image from static files
  const fallbackImageSrc = `/cases/case-${caseStudy.id}.png`;

  useEffect(() => {
    if (!jobCategory || !industry || hasGenerated) return;

    let cancelled = false;
    setIsGenerating(true);

    const generateCase = async () => {
      try {
        const response = await fetch('/api/ai/generate-case', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobCategory,
            industry,
            consultationContent,
            caseId: caseStudy.id,
          }),
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        if (cancelled) return;

        if (data.text) {
          setGeneratedText(data.text);
        }
        if (data.imageUrl) {
          setGeneratedImageUrl(data.imageUrl);
        }
      } catch (e) {
        console.warn('Failed to generate case content:', e);
        // Fallback: use original mock data (no state update needed)
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
          setHasGenerated(true);
        }
      }
    };

    generateCase();

    return () => {
      cancelled = true;
    };
  }, [jobCategory, industry, consultationContent, caseStudy.id, hasGenerated]);

  // Use generated text or fall back to original case data
  const displayTitle = generatedText?.title || caseStudy.title;
  const displayBackground = generatedText?.background || caseStudy.background;
  const displayRequestedContent = generatedText?.requestedContent || caseStudy.requestedContent;
  const displayActualServices = generatedText?.actualServices || caseStudy.actualServices;
  const displayContractPlan = generatedText?.contractPlan || caseStudy.contractPlan;

  // Use generated image or fallback to static image
  const imageSrc = generatedImageUrl || fallbackImageSrc;
  const imageAlt = `${displayTitle}の業務フロー図`;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Workflow diagram image */}
        <div
          className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">事例を生成中...</span>
            </div>
          ) : (
            <>
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
                <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  クリックで拡大
                </span>
              </div>
            </>
          )}
        </div>

        <div className="p-6 space-y-4">
          {isGenerating ? (
            // Skeleton loading state
            <div className="space-y-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="h-6 bg-gray-200 rounded-full w-1/3" />
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900">{displayTitle}</h3>

              {/* Background */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">依頼された背景</h4>
                <p className="text-sm text-gray-600">{displayBackground}</p>
              </div>

              {/* Requested Content */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">依頼内容</h4>
                <p className="text-sm text-gray-600">{displayRequestedContent}</p>
              </div>

              {/* Actual Services */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">HELPYOUが実際に行っている業務</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{displayActualServices}</p>
              </div>

              {/* Contract Plan */}
              <div className="pt-3 border-t border-gray-100">
                <span className="inline-block px-3 py-1 bg-red-100 text-primary text-sm font-medium rounded-full">
                  {displayContractPlan}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <ImageModal
        src={imageSrc}
        alt={imageAlt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
