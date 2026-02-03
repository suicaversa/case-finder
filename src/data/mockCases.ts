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
  {
    id: '6',
    title: '給与計算・社会保険手続きの代行',
    background: '従業員50名規模の製造業で、総務担当者が退職。給与計算や社会保険手続きを引き継げる人材がいない状況でした。',
    requestedContent: '給与計算と社会保険関連の手続きを丸ごと任せたい。',
    actualServices: '・給与計算・明細発行\n・社会保険手続き\n・年末調整対応\n・勤怠データ集計',
    contractPlan: 'チームプラン（月40時間）',
    imageUrl: '/mock/case-hr2.svg',
    jobCategories: ['hr', 'accounting'],
    industries: ['manufacturing', 'service'],
  },
  {
    id: '7',
    title: '請求書発行・入金管理の効率化',
    background: 'ECサイトを運営する企業で、取引先が増加し請求業務が煩雑化。ミスや遅延が発生するようになっていました。',
    requestedContent: '請求書発行から入金確認までの一連の業務を代行してほしい。',
    actualServices: '・請求書作成・発行\n・入金消込\n・督促対応\n・売掛金管理表作成',
    contractPlan: 'チームプラン（月25時間）',
    imageUrl: '/mock/case-accounting2.svg',
    jobCategories: ['accounting', 'sales-admin'],
    industries: ['ec-retail', 'it-web'],
  },
  {
    id: '8',
    title: 'ITヘルプデスクの外部委託',
    background: '急成長中のスタートアップで、社内のIT問い合わせが情シス担当1名に集中。本来の業務に支障が出ていました。',
    requestedContent: '社内からのIT関連問い合わせの一次対応を任せたい。',
    actualServices: '・社内問い合わせ対応\n・PC・アカウント設定サポート\n・マニュアル作成・更新\n・問い合わせ履歴管理',
    contractPlan: 'チームプラン（月60時間）',
    imageUrl: '/mock/case-it.svg',
    jobCategories: ['it', 'customer-support'],
    industries: ['it-web', 'service'],
  },
];

// Get matching cases with support for pagination
export function findMatchingCases(jobCategory: string, industry: string): CaseStudy[] {
  // Prioritize exact matches, then partial matches
  const exactMatches = mockCases.filter(
    (c) => c.jobCategories.includes(jobCategory) && c.industries.includes(industry)
  );
  const partialMatches = mockCases.filter(
    (c) =>
      (c.jobCategories.includes(jobCategory) || c.industries.includes(industry)) &&
      !exactMatches.includes(c)
  );
  const remaining = mockCases.filter(
    (c) => !exactMatches.includes(c) && !partialMatches.includes(c)
  );

  // Return ordered list (exact > partial > remaining)
  const result = [...exactMatches, ...partialMatches, ...remaining];

  // Ensure we have at least 8 cases for pagination demo
  return result.slice(0, 8);
}
