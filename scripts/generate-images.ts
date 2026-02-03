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
    prompt: `HELPYOUの経理サポート業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・仕訳入力・チェック
・請求書処理
・経費精算処理
・月次レポート作成補助
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '2',
    title: '採用事務・入社手続きの代行',
    prompt: `HELPYOUの採用事務サポート業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・応募者対応（メール・日程調整）
・入社書類の準備・回収
・社内システムへのデータ入力
・入社オリエンテーション資料作成
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '3',
    title: '営業資料・提案書作成サポート',
    prompt: `HELPYOUの営業資料作成サポート業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・提案書テンプレートの作成
・顧客別カスタマイズ資料作成
・競合分析資料の整理
・見積書作成補助
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '4',
    title: 'カスタマーサポート体制の構築',
    prompt: `HELPYOUのカスタマーサポート業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・メール問い合わせの一次対応
・FAQ作成・更新
・問い合わせ内容の分類・集計
・エスカレーション対応
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '5',
    title: 'マーケティング施策の運用代行',
    prompt: `HELPYOUのマーケティング運用代行業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・SNS投稿作成・スケジュール管理
・メルマガ作成・配信
・広告レポート作成
・競合調査
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '6',
    title: '給与計算・社会保険手続きの代行',
    prompt: `HELPYOUの給与・社保業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・給与計算・明細発行
・社会保険手続き
・年末調整対応
・勤怠データ集計
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '7',
    title: '請求書発行・入金管理の効率化',
    prompt: `HELPYOUの請求・入金管理業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・請求書作成・発行
・入金消込
・督促対応
・売掛金管理表作成
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
  },
  {
    id: '8',
    title: 'ITヘルプデスクの外部委託',
    prompt: `HELPYOUのITヘルプデスク業務を説明する図を生成してください。
以下の4つの業務内容をアイコンと日本語ラベルで図解してください：
・社内問い合わせ対応
・PC・アカウント設定サポート
・マニュアル作成・更新
・問い合わせ履歴管理
フラットデザイン、白背景、赤(#CC0000)をアクセントカラーに。見やすいインフォグラフィック形式で。`,
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
