import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import { getCategoryLabel, getIndustryLabel } from '@/lib/aiComment';

interface ImageRequestBody {
  theme?: string;
  jobCategory?: string;
  industry?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequestBody = await request.json();
    const { jobCategory, industry } = body;

    const catLabel = getCategoryLabel(jobCategory || 'other');
    const indLabel = getIndustryLabel(industry || 'other');

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        imageUrl: null,
        isPlaceholder: true,
        message: `${indLabel}における${catLabel}の業務フローイメージです。（APIキー未設定のためプレースホルダー）`,
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 方法1: gemini-3-pro-image-preview でネイティブ画像生成
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: `${indLabel}の企業が${catLabel}をアウトソーシングする業務フローを表す、清潔感のあるビジネスイラストを生成してください。フラットデザインで、明るい色合いのイラストをお願いします。`,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: '1K',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      let imageBase64: string | null = null;
      let textContent = '';

      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textContent += part.text;
        }
      }

      if (imageBase64) {
        return NextResponse.json({
          imageUrl: imageBase64,
          isPlaceholder: false,
          message: textContent || `${indLabel}における${catLabel}の業務イメージを生成しました。`,
        });
      }

      // 画像なしだがテキストはある場合
      if (textContent) {
        return NextResponse.json({
          imageUrl: null,
          isPlaceholder: true,
          message: textContent,
        });
      }
    } catch (e) {
      console.warn('gemini-3-pro-image-preview failed:', e);
    }

    // 方法2: Imagen 4 で画像生成
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A clean, professional flat-design business workflow illustration showing ${catLabel} outsourcing process for ${indLabel} industry. Modern corporate style, light colors, no text.`,
        config: {
          numberOfImages: 1,
        },
      });

      const image = response.generatedImages?.[0];
      if (image?.image?.imageBytes) {
        const imageBase64 = `data:image/png;base64,${image.image.imageBytes}`;
        return NextResponse.json({
          imageUrl: imageBase64,
          isPlaceholder: false,
          message: `${indLabel}における${catLabel}の業務フローイメージを生成しました。`,
        });
      }
    } catch (e) {
      console.warn('imagen-4.0-generate-001 failed:', e);
    }

    // 方法3: テキストのみフォールバック（gemini-2.5-flash）
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${indLabel}の企業が${catLabel}をアウトソーシングする際の典型的な業務フローを、ステップごとに簡潔に説明してください。150文字以内で。`,
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      imageUrl: null,
      isPlaceholder: true,
      message: textResponse.text || `${indLabel}における${catLabel}の業務フローイメージです。`,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      imageUrl: null,
      isPlaceholder: true,
      message: '画像の生成中にエラーが発生しました。再度お試しください。',
    });
  }
}
