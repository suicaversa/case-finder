import 'dotenv/config';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const mockCases = [
  {
    id: 'case-1',
    title: '経理業務の月次決算サポート',
    background: '急成長中のIT企業で、経理担当者が1名のみ。月次決算に追われ、本来注力すべき経営分析や予算管理に時間が割けない状況でした。',
    requestedContent: '月次決算業務の一部をアウトソースし、経理担当者の負担を軽減したい。',
    actualServices: ['仕訳入力・チェック', '請求書処理', '経費精算処理', '月次レポート作成補助'],
    contractPlan: 'チームプラン（月30時間）',
    imageUrl: '/mock/case-accounting.svg',
    jobCategories: ['accounting'],
    industries: ['it-web', 'service'],
  },
  {
    id: 'case-2',
    title: '採用事務・入社手続きの代行',
    background: 'EC事業を展開する企業で、事業拡大に伴い採用人数が急増。人事担当が面接対応に追われ、入社手続きや書類管理が後回しになっていました。',
    requestedContent: '採用に関わる事務作業全般をサポートしてほしい。',
    actualServices: ['応募者対応（メール・日程調整）', '入社書類の準備・回収', '社内システムへのデータ入力', '入社オリエンテーション資料作成'],
    contractPlan: 'チームプラン（月50時間）',
    imageUrl: '/mock/case-hr.svg',
    jobCategories: ['hr'],
    industries: ['ec-retail', 'it-web'],
  },
  {
    id: 'case-3',
    title: '営業資料・提案書作成サポート',
    background: '製造業の営業チームで、提案書作成に多くの時間を費やしており、顧客訪問の時間が確保できない課題がありました。',
    requestedContent: '営業資料のテンプレート化と、個別提案書の作成を依頼したい。',
    actualServices: ['提案書テンプレートの作成', '顧客別カスタマイズ資料作成', '競合分析資料の整理', '見積書作成補助'],
    contractPlan: '1名専属プラン',
    imageUrl: '/mock/case-sales.svg',
    jobCategories: ['sales-admin'],
    industries: ['manufacturing', 'service'],
  },
  {
    id: 'case-4',
    title: 'カスタマーサポート体制の構築',
    background: 'SaaSサービスを提供するスタートアップで、ユーザー数増加に伴い問い合わせが急増。創業メンバーが対応していたが限界に達していました。',
    requestedContent: 'カスタマーサポートの一次対応を任せたい。',
    actualServices: ['メール問い合わせの一次対応', 'FAQ作成・更新', '問い合わせ内容の分類・集計', 'エスカレーション対応'],
    contractPlan: 'チームプラン（月80時間）',
    imageUrl: '/mock/case-cs.svg',
    jobCategories: ['customer-support'],
    industries: ['it-web', 'service'],
  },
  {
    id: 'case-5',
    title: 'マーケティング施策の運用代行',
    background: '不動産会社で、Webマーケティングを強化したいが、社内にデジタルマーケティングの知見を持つ人材がいませんでした。',
    requestedContent: 'SNS運用やメルマガ配信などのマーケティング業務を任せたい。',
    actualServices: ['SNS投稿作成・スケジュール管理', 'メルマガ作成・配信', '広告レポート作成', '競合調査'],
    contractPlan: 'チームプラン（月40時間）',
    imageUrl: '/mock/case-marketing.svg',
    jobCategories: ['marketing'],
    industries: ['real-estate', 'service'],
  },
  {
    id: 'case-6',
    title: '給与計算・社会保険手続きの代行',
    background: '従業員50名規模の製造業で、総務担当者が退職。給与計算や社会保険手続きを引き継げる人材がいない状況でした。',
    requestedContent: '給与計算と社会保険関連の手続きを丸ごと任せたい。',
    actualServices: ['給与計算・明細発行', '社会保険手続き', '年末調整対応', '勤怠データ集計'],
    contractPlan: 'チームプラン（月40時間）',
    imageUrl: '/mock/case-hr2.svg',
    jobCategories: ['hr', 'accounting'],
    industries: ['manufacturing', 'service'],
  },
  {
    id: 'case-7',
    title: '請求書発行・入金管理の効率化',
    background: 'ECサイトを運営する企業で、取引先が増加し請求業務が煩雑化。ミスや遅延が発生するようになっていました。',
    requestedContent: '請求書発行から入金確認までの一連の業務を代行してほしい。',
    actualServices: ['請求書作成・発行', '入金消込', '督促対応', '売掛金管理表作成'],
    contractPlan: 'チームプラン（月25時間）',
    imageUrl: '/mock/case-accounting2.svg',
    jobCategories: ['accounting', 'sales-admin'],
    industries: ['ec-retail', 'it-web'],
  },
  {
    id: 'case-8',
    title: 'ITヘルプデスクの外部委託',
    background: '急成長中のスタートアップで、社内のIT問い合わせが情シス担当1名に集中。本来の業務に支障が出ていました。',
    requestedContent: '社内からのIT関連問い合わせの一次対応を任せたい。',
    actualServices: ['社内問い合わせ対応', 'PC・アカウント設定サポート', 'マニュアル作成・更新', '問い合わせ履歴管理'],
    contractPlan: 'チームプラン（月60時間）',
    imageUrl: '/mock/case-it.svg',
    jobCategories: ['it', 'customer-support'],
    industries: ['it-web', 'service'],
  },
];

interface ChatMsg {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

const mockInquiries: Array<{
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyUrl: string;
  jobCategory: string;
  industry: string;
  consultationContent: string;
  status: string;
  shownCaseIds: string[];
  notes: string;
  chatMessages: ChatMsg[];
}> = [
  {
    id: 'inq-001',
    createdAt: new Date('2026-02-03T10:30:00'),
    name: 'やまだ たろう',
    email: 'yamada@example.co.jp',
    phone: '03-1234-5678',
    companyName: '株式会社サンプル',
    companyUrl: 'https://example.co.jp',
    jobCategory: 'accounting',
    industry: 'it-web',
    consultationContent: '経理業務の一部をアウトソースしたいと考えています。月次決算のサポートをお願いしたいです。',
    status: '未対応',
    shownCaseIds: ['case-1', 'case-4'],
    notes: '',
    chatMessages: [
      { id: 'chat-001-1', role: 'user', content: '月次決算のサポートはどのくらいの工数になりますか？', createdAt: new Date('2026-02-03T10:35:00') },
      { id: 'chat-001-2', role: 'assistant', content: '業務量によって変わりますが、月次の仕訳件数や締め日を伺いながら目安の工数をご案内できます。必要であれば担当からお見積りいたします。', createdAt: new Date('2026-02-03T10:35:25') },
      { id: 'chat-001-3', role: 'user', content: 'セキュリティ面が心配です。', createdAt: new Date('2026-02-03T10:36:10') },
      { id: 'chat-001-4', role: 'assistant', content: 'NDA締結やアクセス権限の管理、作業ログの記録など、情報管理の体制を整えています。詳細は面談時にご説明します。', createdAt: new Date('2026-02-03T10:36:40') },
    ],
  },
  {
    id: 'inq-002',
    createdAt: new Date('2026-02-03T09:15:00'),
    name: 'すずき はなこ',
    email: 'suzuki@retail.co.jp',
    phone: '06-9876-5432',
    companyName: '小売株式会社',
    companyUrl: 'https://retail.co.jp',
    jobCategory: 'hr',
    industry: 'ec-retail',
    consultationContent: '採用が急増しており、入社手続きの対応が追いつきません。',
    status: '対応中',
    shownCaseIds: ['case-2', 'case-6'],
    notes: '2/3 電話済み。来週打ち合わせ予定。',
    chatMessages: [
      { id: 'chat-002-1', role: 'user', content: '入社手続きのどこまでお願いできますか？', createdAt: new Date('2026-02-03T09:20:00') },
      { id: 'chat-002-2', role: 'assistant', content: '書類回収、入社案内、アカウント申請の代行など、範囲を柔軟に設計できます。現状のフローを教えていただければ整理します。', createdAt: new Date('2026-02-03T09:20:30') },
    ],
  },
  {
    id: 'inq-003',
    createdAt: new Date('2026-02-02T16:45:00'),
    name: 'たなか いちろう',
    email: 'tanaka@manufacturing.jp',
    phone: '052-111-2222',
    companyName: '製造工業株式会社',
    companyUrl: 'https://manufacturing.jp',
    jobCategory: 'sales-admin',
    industry: 'manufacturing',
    consultationContent: '営業資料の作成に時間がかかりすぎています。',
    status: '対応済み',
    shownCaseIds: ['case-3', 'case-7'],
    notes: '2/2 契約締結。チームプラン（月30時間）で開始。',
    chatMessages: [],
  },
  {
    id: 'inq-004',
    createdAt: new Date('2026-02-02T14:20:00'),
    name: 'さとう みき',
    email: 'sato@startup.io',
    phone: '03-5555-6666',
    companyName: 'スタートアップ株式会社',
    companyUrl: 'https://startup.io',
    jobCategory: 'customer-support',
    industry: 'it-web',
    consultationContent: 'カスタマーサポートの体制を整えたいです。問い合わせが急増しています。',
    status: '未対応',
    shownCaseIds: ['case-4', 'case-8'],
    notes: '',
    chatMessages: [
      { id: 'chat-004-1', role: 'user', content: 'FAQの整備もお願いできますか？', createdAt: new Date('2026-02-02T14:25:00') },
      { id: 'chat-004-2', role: 'assistant', content: 'はい、問い合わせ内容を整理しながらFAQ作成・更新まで対応可能です。テンプレートがあればお送りください。', createdAt: new Date('2026-02-02T14:25:20') },
    ],
  },
  {
    id: 'inq-005',
    createdAt: new Date('2026-02-01T11:00:00'),
    name: 'おおた けんじ',
    email: 'ohta@realestate.co.jp',
    phone: '03-7777-8888',
    companyName: '不動産株式会社',
    companyUrl: 'https://realestate.co.jp',
    jobCategory: 'marketing',
    industry: 'real-estate',
    consultationContent: 'SNSマーケティングを強化したいのですが、社内にノウハウがありません。',
    status: '対応中',
    shownCaseIds: ['case-5'],
    notes: '2/1 初回ヒアリング完了。提案書作成中。',
    chatMessages: [
      { id: 'chat-005-1', role: 'user', content: '投稿頻度はどれくらいが適切ですか？', createdAt: new Date('2026-02-01T11:05:00') },
      { id: 'chat-005-2', role: 'assistant', content: '目的や媒体によって異なりますが、まずは週2〜3回から始めるケースが多いです。現状の運用状況を伺いながらご提案します。', createdAt: new Date('2026-02-01T11:05:25') },
    ],
  },
];

async function main() {
  await client.connect();
  console.log('Seeding database...');

  // Clear existing data
  await client.query('DELETE FROM "ChatMessage"');
  await client.query('DELETE FROM "Inquiry"');
  await client.query('DELETE FROM "CaseStudy"');

  // Seed case studies
  for (const c of mockCases) {
    await client.query(
      `INSERT INTO "CaseStudy" (id, title, background, "requestedContent", "actualServices", "contractPlan", "imageUrl", "jobCategories", industries)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [c.id, c.title, c.background, c.requestedContent, JSON.stringify(c.actualServices), c.contractPlan, c.imageUrl, c.jobCategories, c.industries]
    );
  }
  console.log(`Seeded ${mockCases.length} case studies`);

  // Seed inquiries with chat messages
  for (const inq of mockInquiries) {
    const now = new Date();
    await client.query(
      `INSERT INTO "Inquiry" (id, name, email, phone, "companyName", "companyUrl", "jobCategory", industry, "consultationContent", status, "shownCaseIds", notes, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [inq.id, inq.name, inq.email, inq.phone, inq.companyName, inq.companyUrl, inq.jobCategory, inq.industry, inq.consultationContent, inq.status, inq.shownCaseIds, inq.notes, inq.createdAt, now]
    );

    for (const msg of inq.chatMessages) {
      await client.query(
        `INSERT INTO "ChatMessage" (id, "inquiryId", role, content, "createdAt")
         VALUES ($1, $2, $3, $4, $5)`,
        [msg.id, inq.id, msg.role, msg.content, msg.createdAt]
      );
    }
  }
  console.log(`Seeded ${mockInquiries.length} inquiries with chat messages`);

  console.log('Seeding complete!');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
