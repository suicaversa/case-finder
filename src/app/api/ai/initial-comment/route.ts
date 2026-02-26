import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
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

対応可能な業務の例:
- 経理・会計: 仕訳入力、請求書処理、経費精算、月次レポート作成
- 人事・労務: 採用事務、入社手続き、給与計算、社会保険手続き
- 営業事務: 提案書作成、見積書作成、顧客データ管理
- カスタマーサポート: メール問い合わせ対応、FAQ作成、問い合わせ集計
- IT / 情シス: ヘルプデスク、PC設定サポート、マニュアル作成
- マーケティング: SNS運用、メルマガ配信、広告レポート作成

回答のルール:
- 日本語で回答してください
- 丁寧かつ親しみやすいトーンで回答してください
- ユーザーの業界・業務に合わせて、HELPYOUがどう役立てるか具体的に触れてください
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
