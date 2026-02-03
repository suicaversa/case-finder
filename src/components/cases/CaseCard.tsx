'use client';

import { CaseStudy } from '@/types';

interface Props {
  caseStudy: CaseStudy;
}

export function CaseCard({ caseStudy }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Workflow diagram image */}
      <div className="bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
        <img
          src={`/cases/case-${caseStudy.id}.png`}
          alt={`${caseStudy.title}の業務フロー図`}
          className="w-full h-full object-contain"
        />
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
