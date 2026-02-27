'use client';

import { DifyCaseStudy } from '@/types';

interface Props {
  caseStudy: DifyCaseStudy;
}

function normalizeFlowDiagramPath(path: string | undefined): string | null {
  if (!path) return null;
  // Extract case-study-{ID}-flow.jpg from any malformed path
  const match = path.match(/(case-study-\d+-flow\.jpe?g)/i);
  if (!match) return null;
  return `/case-images/${match[1]}`;
}

export function CaseCard({ caseStudy }: Props) {
  const imagePath = normalizeFlowDiagramPath(caseStudy.flowDiagramPath);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Flow diagram image */}
      <div className="relative bg-gray-50 flex items-center justify-center overflow-hidden">
        {imagePath ? (
          <img
            src={imagePath}
            alt={`${caseStudy.title} 業務フロー図`}
            className="w-full h-auto"
          />
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400 w-full">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs">事例イメージ</span>
          </div>
        )}
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
          <ul className="text-sm text-gray-600 space-y-1">
            {caseStudy.actualServices.map((service, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">・</span>
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
