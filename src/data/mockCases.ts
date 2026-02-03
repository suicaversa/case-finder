import { CaseStudy } from '@/types';

export const mockCases: CaseStudy[] = [
  {
    id: '1',
    title: '経理業務の月次決算サポート',
    background: '急成長中のIT企業で、経理担当者が1名のみ。月次決算に追われ、本来注力すべき経営分析や予算管理に時間が割けない状況でした。',
    requestedContent: '月次決算業務の一部をアウトソースし、経理担当者の負担を軽減したい。',
    actualServices: '・仕訳入力・チェック\n・請求書処理\n・経費精算処理\n・月次レポート作成補助',
    contractPlan: 'チームプラン（月30時間）',
    imageUrl: '/mock/case-accounting.svg',
    jobCategories: ['accounting'],
    industries: ['it-web', 'service'],
  },
  {
    id: '2',
    title: '採用事務・入社手続きの代行',
    background: 'EC事業を展開する企業で、事業拡大に伴い採用人数が急増。人事担当が面接対応に追われ、入社手続きや書類管理が後回しになっていました。',
    requestedContent: '採用に関わる事務作業全般をサポートしてほしい。',
    actualServices: '・応募者対応（メール・日程調整）\n・入社書類の準備・回収\n・社内システムへのデータ入力\n・入社オリエンテーション資料作成',
    contractPlan: 'チームプラン（月50時間）',
    imageUrl: '/mock/case-hr.svg',
    jobCategories: ['hr'],
    industries: ['ec-retail', 'it-web'],
  },
  {
    id: '3',
    title: '営業資料・提案書作成サポート',
    background: '製造業の営業チームで、提案書作成に多くの時間を費やしており、顧客訪問の時間が確保できない課題がありました。',
    requestedContent: '営業資料のテンプレート化と、個別提案書の作成を依頼したい。',
    actualServices: '・提案書テンプレートの作成\n・顧客別カスタマイズ資料作成\n・競合分析資料の整理\n・見積書作成補助',
    contractPlan: '1名専属プラン',
    imageUrl: '/mock/case-sales.svg',
    jobCategories: ['sales-admin'],
    industries: ['manufacturing', 'service'],
  },
  {
    id: '4',
    title: 'カスタマーサポート体制の構築',
    background: 'SaaSサービスを提供するスタートアップで、ユーザー数増加に伴い問い合わせが急増。創業メンバーが対応していたが限界に達していました。',
    requestedContent: 'カスタマーサポートの一次対応を任せたい。',
    actualServices: '・メール問い合わせの一次対応\n・FAQ作成・更新\n・問い合わせ内容の分類・集計\n・エスカレーション対応',
    contractPlan: 'チームプラン（月80時間）',
    imageUrl: '/mock/case-cs.svg',
    jobCategories: ['customer-support'],
    industries: ['it-web', 'service'],
  },
  {
    id: '5',
    title: 'マーケティング施策の運用代行',
    background: '不動産会社で、Webマーケティングを強化したいが、社内にデジタルマーケティングの知見を持つ人材がいませんでした。',
    requestedContent: 'SNS運用やメルマガ配信などのマーケティング業務を任せたい。',
    actualServices: '・SNS投稿作成・スケジュール管理\n・メルマガ作成・配信\n・広告レポート作成\n・競合調査',
    contractPlan: 'チームプラン（月40時間）',
    imageUrl: '/mock/case-marketing.svg',
    jobCategories: ['marketing'],
    industries: ['real-estate', 'service'],
  },
];

// Simple matching function for mock
export function findMatchingCases(jobCategory: string, industry: string): CaseStudy[] {
  const matches = mockCases.filter(
    (c) => c.jobCategories.includes(jobCategory) || c.industries.includes(industry)
  );
  // Return at least 2 cases even if no match
  if (matches.length === 0) {
    return mockCases.slice(0, 2);
  }
  return matches;
}
