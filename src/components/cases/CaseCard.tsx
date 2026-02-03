'use client';

import { CaseStudy } from '@/types';

interface Props {
  caseStudy: CaseStudy;
}

export function CaseCard({ caseStudy }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Image placeholder */}
      <div className="bg-gray-100 h-48 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          <p className="text-sm">業務フロー図</p>
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
  );
}
