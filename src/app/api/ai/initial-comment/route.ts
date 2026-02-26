import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { mockCases } from '@/data/mockCases';
import { getCategoryLabel, getIndustryLabel } from '@/lib/aiComment';
import { generateAIComment } from '@/lib/aiComment';

interface InitialCommentRequestBody {
  jobCategory: string;
  industry: string;
  consultationContent?: string;
}

const SYSTEM_PROMPT = `あなたはHELPYOU（ヘルプユー）というオンラインアウトソーシングサービスの事例紹介AIアシスタントです。

HELPYOUは、バックオフィス業務をオンラインでアウトソースできるサービスです。
経理・人事・営業事務・カスタマーサポート・IT・マーケティングなど幅広い業務に対応しています。

以下がHELPYOUの事例データです：

${mockCases.map((c) => `【事例: ${c.title}】
背景: ${c.background}
依頼内容: ${c.requestedContent}
実際のサービス: ${c.actualServices}
契約プラン: ${c.contractPlan}
`).join('\n')}

回答のルール:
- 日本語で回答してください
- 丁寧かつ親しみやすいトーンで回答してください
- ユーザーの業界・業務に関連する事例を1〜2つ具体的に言及してください
- 300文字程度で簡潔に回答してください
- マークダウンは使わず、プレーンテキストで回答してください
- 最後に「以下に、御社に近い事例をピックアップしましたので、ぜひご覧ください！」で締めてください`;

export async function POST(request: NextRequest) {
  try {
    const body: InitialCommentRequestBody = await request.json();
    const { jobCategory, industry, consultationContent } = body;

    const catLabel = getCategoryLabel(jobCategory);
    const indLabel = getIndustryLabel(industry);

    // APIキーがない場合はフォールバック
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        message: generateAIComment({ jobCategory, industry, consultationContent }),
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let userPrompt = `私は${indLabel}の企業で、${catLabel}についてアウトソーシングを検討しています。`;
    if (consultationContent) {
      userPrompt += `\n具体的な相談内容: ${consultationContent}`;
    }
    userPrompt += '\n\nHELPYOUの事例を踏まえて、私の状況に合った初回の挨拶と事例紹介をお願いします。';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 8192,
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({
        message: generateAIComment({ jobCategory, industry, consultationContent }),
      });
    }

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Initial comment error:', error);
    // フォールバック
    const body: InitialCommentRequestBody = await request.clone().json().catch(() => ({
      jobCategory: 'other', industry: 'other',
    }));
    return NextResponse.json({
      message: generateAIComment(body),
    });
  }
}
