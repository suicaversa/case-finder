import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const cases = [
  {
    id: '1',
    title: '経理業務の月次決算サポート',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「経理データ受領」→ ステップ2「HELPYOU処理（仕訳・請求書・経費精算）」→ ステップ3「月次レポート納品」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '2',
    title: '採用事務・入社手続きの代行',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「応募受付」→ ステップ2「HELPYOU対応（日程調整・書類準備）」→ ステップ3「入社手続き完了」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '3',
    title: '営業資料・提案書作成サポート',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「営業から依頼」→ ステップ2「HELPYOU作成（テンプレート・カスタマイズ）」→ ステップ3「提案書納品」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '4',
    title: 'カスタマーサポート体制の構築',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「顧客問い合わせ」→ ステップ2「HELPYOU一次対応」→ ステップ3「解決・エスカレーション」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '5',
    title: 'マーケティング施策の運用代行',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「マーケ方針受領」→ ステップ2「HELPYOU運用（SNS・メルマガ）」→ ステップ3「レポート報告」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '6',
    title: '給与計算・社会保険手続きの代行',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「勤怠データ受領」→ ステップ2「HELPYOU処理（給与計算・社保）」→ ステップ3「給与明細発行」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '7',
    title: '請求書発行・入金管理の効率化',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「売上データ受領」→ ステップ2「HELPYOU処理（請求書・入金消込）」→ ステップ3「管理完了」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
  {
    id: '8',
    title: 'ITヘルプデスクの外部委託',
    prompt: '業務フロー図を生成してください。横向きの3ステップ図で、各ノードにはアイコンと日本語の説明文を含めてください。ステップ1「社員からIT問い合わせ」→ ステップ2「HELPYOU対応・マニュアル化」→ ステップ3「問題解決」。フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。',
  },
];

async function generateImage(caseItem: (typeof cases)[0]) {
  console.log(`Generating image for: ${caseItem.title}`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ text: caseItem.prompt }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      console.error(`No response for ${caseItem.id}`);
      return;
    }

    for (const part of parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;

        const outputDir = path.join(process.cwd(), 'public', 'cases');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `case-${caseItem.id}.png`);
        fs.writeFileSync(outputPath, Buffer.from(imageData!, 'base64'));
        console.log(`Saved: ${outputPath}`);
      }
    }
  } catch (error) {
    console.error(`Error generating image for ${caseItem.id}:`, error);
  }
}

async function main() {
  for (const caseItem of cases) {
    await generateImage(caseItem);
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  console.log('Done!');
}

main();
