import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getCategoryLabel, getIndustryLabel } from '@/lib/aiComment';

interface DifyCaseInput {
  title: string;
  background: string;
  requestedContent: string;
  actualServices: string[];
}

function buildSystemPrompt(displayedCases?: DifyCaseInput[]): string {
  let casesText = '（事例はまだ読み込まれていません）';

  if (displayedCases && displayedCases.length > 0) {
    casesText = displayedCases.map((c) => `【事例: ${c.title}】
背景: ${c.background}
依頼内容: ${c.requestedContent}
実際のサービス: ${c.actualServices.join('、')}
`).join('\n');
  }

  return `あなたはHELPYOU（ヘルプユー）というオンラインアウトソーシングサービスの事例紹介AIアシスタントです。

HELPYOUは、バックオフィス業務をオンラインでアウトソースできるサービスです。
経理・人事・営業事務・カスタマーサポート・IT・マーケティングなど幅広い業務に対応しています。

現在ユーザーに以下の事例が表示されています。ユーザーの質問に対して、これらの事例を根拠として回答してください：

${casesText}

回答のルール:
- 日本語で回答してください
- 丁寧かつ親しみやすいトーンで回答してください
- 質問に関連する事例がある場合は、具体的にその事例のタイトルや内容を引用して回答してください
- 料金について聞かれた場合は、具体的な金額は伝えず営業担当への案内を促してください
- 150〜250文字程度で簡潔に回答してください
- マークダウンは使わず、プレーンテキストで回答してください`;
}

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  jobCategory?: string;
  industry?: string;
  consultationContent?: string;
  displayedCases?: DifyCaseInput[];
}

function generateFallbackReply(message: string, jobCategory?: string, industry?: string): string {
  const catMsg = getCategoryLabel(jobCategory || 'other');
  const indMsg = getIndustryLabel(industry || 'other');
  const normalized = message.trim();

  if (/(料金|費用|価格|単価|コスト)/.test(normalized)) {
    return '料金は業務量や難易度によって変わります。現状の作業量を伺いながら、最適なプランと目安をご案内します。詳しくは営業担当からご説明いたしますので、お気軽にお問い合わせください。';
  }
  if (/(導入|開始|スケジュール|期間|いつから)/.test(normalized)) {
    return '最短1〜2週間で立ち上げ可能です。業務の内容や規模に応じて、スムーズな導入スケジュールをご提案いたします。';
  }
  if (/(セキュリティ|情報|機密|NDA|権限)/i.test(normalized)) {
    return 'NDAの締結やアクセス権限の管理、作業ログの記録など、情報管理の体制を整えています。安心してお任せいただけます。';
  }
  if (/(体制|担当|メンバー|チーム)/.test(normalized)) {
    return `${indMsg}での対応実績があるチームで進めます。${catMsg}に詳しい担当者をアサインしますので、ご安心ください。`;
  }

  return `${indMsg}の${catMsg}に合わせて柔軟に対応できます。もう少し具体的に「どの業務」「頻度」「目標」を教えていただけると、より詳しくご案内できます。`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, jobCategory, industry, consultationContent, displayedCases } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // If no API key, return fallback mock response
    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackReply(lastUserMessage, jobCategory, industry);
      return NextResponse.json({ message: fallback });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const catMsg = getCategoryLabel(jobCategory || 'other');
    const indMsg = getIndustryLabel(industry || 'other');

    // ユーザーのコンテキスト情報をシステムプロンプトに統合する
    // （contents配列を純粋な会話履歴のみにすることで、マルチターンの文脈理解を向上させる）
    const basePrompt = buildSystemPrompt(displayedCases);
    let userContext = `\n\n現在のユーザー情報:\n- 業界: ${indMsg}\n- 業務カテゴリ: ${catMsg}`;
    if (consultationContent) {
      userContext += `\n- 相談内容: ${consultationContent}`;
    }
    const fullSystemPrompt = basePrompt + userContext;

    // contents配列には会話履歴のみを含める（余分なコンテキストメッセージを混ぜない）
    // これによりGeminiがマルチターンの会話の流れを正しく追跡できる
    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }],
    }));

    // 会話履歴の文字数に応じて出力トークン上限を動的に算出
    // 日本語は1文字≒1.5〜2トークン。会話が長くなるほど余裕を持たせる
    const totalInputChars = messages.reduce((sum, m) => sum + m.content.length, 0) + fullSystemPrompt.length;
    const estimatedInputTokens = Math.ceil(totalInputChars * 2);
    const dynamicMaxTokens = Math.max(4096, estimatedInputTokens + 2048);

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents,
      config: {
        systemInstruction: fullSystemPrompt,
        maxOutputTokens: dynamicMaxTokens,
        temperature: 0.7,
      },
    });

    const text = response.text || generateFallbackReply(lastUserMessage, jobCategory, industry);

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ message: 'ご質問ありがとうございます。担当者が確認の上、詳しくご回答いたします。' });
  }
}
