import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { mockCases, findMatchingCases } from '@/data/mockCases';
import { getCategoryLabel, getIndustryLabel } from '@/lib/aiComment';

interface GenerateCaseRequestBody {
  jobCategory: string;
  industry: string;
  consultationContent?: string;
  caseId: string;
}

// Structured output schema for case text generation
const caseTextSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: '事例のタイトル（20文字以内）',
    },
    background: {
      type: Type.STRING,
      description: '依頼された背景（80〜120文字程度）',
    },
    requestedContent: {
      type: Type.STRING,
      description: '依頼内容（40〜60文字程度）',
    },
    actualServices: {
      type: Type.STRING,
      description: 'HELPYOUが実際に行っている業務（箇条書き、各行は「・」から始める、4〜5項目、改行区切り）',
    },
    contractPlan: {
      type: Type.STRING,
      description: '契約プラン（例: チームプラン（月30時間）、1名専属プラン）',
    },
  },
  required: ['title', 'background', 'requestedContent', 'actualServices', 'contractPlan'],
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCaseRequestBody = await request.json();
    const { jobCategory, industry, consultationContent, caseId } = body;

    // Find the base mock case to use as reference
    const baseCases = findMatchingCases(jobCategory, industry);
    const baseCaseIndex = baseCases.findIndex((c) => c.id === caseId);
    const baseCase = baseCaseIndex >= 0 ? baseCases[baseCaseIndex] : mockCases.find((c) => c.id === caseId);

    if (!baseCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // If no API key, return the original mock case as fallback
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        text: {
          title: baseCase.title,
          background: baseCase.background,
          requestedContent: baseCase.requestedContent,
          actualServices: baseCase.actualServices,
          contractPlan: baseCase.contractPlan,
        },
        imageUrl: null,
        isFallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const catLabel = getCategoryLabel(jobCategory);
    const indLabel = getIndustryLabel(industry);

    // --- Text Generation with Structured Output ---
    let generatedText = null;
    try {
      const textPrompt = `あなたはHELPYOU（ヘルプユー）というオンラインアウトソーシングサービスの事例を作成するアシスタントです。

以下の参考事例をベースに、ユーザーの業界・業務カテゴリに合わせてパーソナライズされた事例テキストを生成してください。

【参考事例】
タイトル: ${baseCase.title}
背景: ${baseCase.background}
依頼内容: ${baseCase.requestedContent}
実際のサービス: ${baseCase.actualServices}
契約プラン: ${baseCase.contractPlan}

【ユーザー情報】
業界: ${indLabel}
業務カテゴリ: ${catLabel}
${consultationContent ? `相談内容: ${consultationContent}` : ''}

上記の参考事例の構造を維持しつつ、ユーザーの業界・業務に合わせて内容をカスタマイズしてください。
実在しそうなリアルな事例にしてください。具体的な業務内容や数字を含めてください。
actualServicesは各項目を「・」で始めて改行で区切ってください。`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: caseTextSchema,
          temperature: 0.8,
          maxOutputTokens: 8192,
        },
      });

      // Check if generation was truncated (finishReason !== 'STOP')
      const finishReason = textResponse.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        console.warn('Text generation finished with reason:', finishReason);
      }

      const responseText = textResponse.text;
      if (responseText) {
        generatedText = JSON.parse(responseText);
      }
    } catch (e) {
      console.warn('Text generation failed:', e);
    }

    // Use fallback text if generation failed
    if (!generatedText) {
      generatedText = {
        title: baseCase.title,
        background: baseCase.background,
        requestedContent: baseCase.requestedContent,
        actualServices: baseCase.actualServices,
        contractPlan: baseCase.contractPlan,
      };
    }

    // --- Image Generation ---
    let imageUrl: string | null = null;
    try {
      // Extract key workflow elements from generated text for the image prompt
      const servicesList = generatedText.actualServices
        .split('\n')
        .filter((line: string) => line.trim().startsWith('・'))
        .map((line: string) => line.trim().replace('・', ''))
        .slice(0, 3)
        .join('、');

      const imagePrompt = `以下の業務フローを表すシンプルなフローチャート図を生成してください。
左から右へ流れる3ステップの図で、矢印で各ステップをつないでください。テキストや文字は一切含めないでください。

【業務フローの内容】
事例: ${generatedText.title}
依頼内容: ${generatedText.requestedContent}
HELPYOUの作業: ${servicesList}

【3ステップの構成】
1. [お客様側・入力物] お客様がHELPYOUに渡すもの（${generatedText.requestedContent}に関連する書類・データ・素材など）を表すアイコンやイラスト
2. [HELPYOU・作業] HELPYOUが行う作業（${servicesList}）を表すアイコンやイラスト（PC作業、チェック、整理など）
3. [成果物・アウトプット] HELPYOUがお客様に納品する成果物を表すアイコンやイラスト（レポート、整理されたデータ、完成物など）

各ステップは大きめのアイコンで表現し、ステップ間を矢印（→）でつないで業務の流れがわかるようにしてください。
フラットデザインのインフォグラフィック風で、清潔感のあるプロフェッショナルなビジネスイメージにしてください。

【カラースキーム・トーン&マナー指示】
- メインカラーは赤 (#CC0000) と白 (#FFFFFF) を基調とすること
- アクセントカラーとして淡い赤やピンク (#ff1a1a、淡いローズ系) を使用すること
- ラインや細部のディテールにはダークグレー (#171717) を使用すること
- 全体的に白ベースの背景に赤系のアクセントを配置した、クリーンでプロフェッショナルなビジネス風イラストにすること
- 過度に派手にせず、落ち着いたトーンで統一感のあるデザインにすること`;

      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: imagePrompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: '1K',
          },
        },
      });

      const parts = imageResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (e) {
      console.warn('Image generation failed for case:', caseId, e);
    }

    return NextResponse.json({
      text: generatedText,
      imageUrl,
      isFallback: false,
    });
  } catch (error) {
    console.error('Generate case error:', error);

    // Full fallback: try to return mock data
    try {
      const body: GenerateCaseRequestBody = await request.clone().json();
      const fallbackCase = mockCases.find((c) => c.id === body.caseId);
      if (fallbackCase) {
        return NextResponse.json({
          text: {
            title: fallbackCase.title,
            background: fallbackCase.background,
            requestedContent: fallbackCase.requestedContent,
            actualServices: fallbackCase.actualServices,
            contractPlan: fallbackCase.contractPlan,
          },
          imageUrl: null,
          isFallback: true,
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { error: 'Failed to generate case content' },
      { status: 500 }
    );
  }
}
