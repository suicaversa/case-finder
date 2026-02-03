'use client';

import { useState } from 'react';
import { CaseStudy } from '@/types';
import { ImageModal } from '@/components/ui/ImageModal';

interface Props {
  caseStudy: CaseStudy;
}

export function CaseCard({ caseStudy }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageSrc = `/cases/case-${caseStudy.id}.png`;
  const imageAlt = `${caseStudy.title}の業務フロー図`;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Workflow diagram image */}
        <div
          className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
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
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900">{caseStudy.title}</h3>

          {/* Background */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">依頼された背景</h4>
            <p className="text-sm text-gray-600">{caseStudy.background}</p>
          </div>

          {/* Requested Content */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">依頼内容</h4>
            <p className="text-sm text-gray-600">{caseStudy.requestedContent}</p>
          </div>

          {/* Actual Services */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">HELPYOUが実際に行っている業務</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{caseStudy.actualServices}</p>
          </div>

          {/* Contract Plan */}
          <div className="pt-3 border-t border-gray-100">
            <span className="inline-block px-3 py-1 bg-red-100 text-primary text-sm font-medium rounded-full">
              {caseStudy.contractPlan}
            </span>
          </div>
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
