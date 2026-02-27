import { NextRequest } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read system prompt from text file
const systemPromptPath = join(process.cwd(), 'src/data/cases-system-prompt.txt');
const systemPromptText = readFileSync(systemPromptPath, 'utf-8');

const responseSchema = {
  type: Type.OBJECT,
  required: ['cases'],
  properties: {
    cases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['title', 'background', 'requestedContent', 'actualServices'],
        properties: {
          title: {
            type: Type.STRING,
            description: '事例タイトル',
          },
          background: {
            type: Type.STRING,
            description: '依頼された背景（140文字程度）',
          },
          requestedContent: {
            type: Type.STRING,
            description: '依頼内容（80文字程度）',
          },
          actualServices: {
            type: Type.ARRAY,
            description: 'HELPYOUが実際に行っている業務',
            items: {
              type: Type.STRING,
            },
          },
        },
      },
    },
  },
};

// Few-shot example
const fewShotUserMessage = `お客様の業種: 不動産
お困りの業務の種類: 人事・労務
お困りの内容(詳細):
  新卒採用業務の一部をアウトソースしたいと考えています。`;

const fewShotModelResponse = JSON.stringify({
  cases: [
    {
      title: '採用業務を75分から15分に短縮！「HELP YOU」がワンストップでサポートします',
      background: 'ハウスメーカーのクライアントが、採用業務の煩雑な調整作業に時間を取られ、他業務への負担が増加している状況でした。',
      requestedContent: '求人票作成・掲載、応募者一次対応、面接日程調整などの採用業務を効率化したい。',
      actualServices: [
        '求人票の作成と掲載',
        '応募者の一次対応',
        '採用担当者と応募者の面接日程調整',
        '合格・不合格通知',
      ],
    },
    {
      title: 'SNSを駆使した最新のリクルーティングスタイル | HELP YOU 活用事例',
      background: '採用業務においてSNSを活用したダイレクトリクルーティングが主流化する中、有望人材からの情報発信をキャッチする必要が生じていましたが、情報収集に時間とリソースが必要で社内対応が困難でした。',
      requestedContent: '対象者のSNSからの情報収集、スプレッドシートへの入力・更新作業を代行してほしい。',
      actualServices: [
        '1日2回（10時・16時）の対象者SNSからの情報収集',
        'スプレッドショットへの入力・更新',
        'スクリーンショット提出からスプレッドシート入力までの一連プロセス実行',
      ],
    },
    {
      title: '月100時間が10時間に短縮！時間のかかる人事業務はHELP YOUにお任せ',
      background: 'スポーツジム経営企業で、学生アルバイトの定着率が低く店舗スタッフが慢性的に不足。アルバイト面接対応に時間を取られ、他の業務が圧迫されていました。',
      requestedContent: '求人サイトへの掲載、応募者の面接調整、ツール管理による応募者受付などを代行してほしい。',
      actualServices: [
        '面接枠の手配とツール入力',
        '面接実施',
        '面接シート・面接名簿の作成',
      ],
    },
    {
      title: 'HELP YOU 活用事例：スケジュール・タスク管理代行で業務効率アップを',
      background: 'SNSコンサルティング業務のクライアントが、複数事業管轄と多数のプロジェクト並行実施により、タスク漏れやスケジュールのダブルブッキングに悩まされていました。',
      requestedContent: 'チャットワーク15部屋分のタスク確認にかかる多大な手間を削減し、タスク管理を一元化したい。',
      actualServices: [
        'スプレッドシート上でのプロジェクトごとのタスク一元管理',
        '状況確認と期限管理の可視化',
        'チャットワーク上でのタスク追加とリマインド連絡',
      ],
    },
    {
      title: '人材採用支援企業 営業活動後に得たヒアリング情報をタイムリーに登録したい',
      background: '人材採用支援企業が、営業活動後に得たヒアリング情報をタイムリーに登録したいが、登録作業に手間と時間を要し、営業活動に充てるリソースを増やしたいと考えていました。',
      requestedContent: '求人管理システムを使用した求人情報の登録代行（月平均10件程度）。',
      actualServices: [
        'マニュアルとレクチャーを通じた要件定義',
        '職種分類の知識を持つアシスタントによる求人情報のシステム登録',
        '外注先への送付、先方との連絡対応、返送後の不備チェック',
      ],
    },
  ],
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { industry, job_category, detail } = await request.json();

  const ai = new GoogleGenAI({ apiKey });

  const userMessage = `お客様の業種: ${industry}
お困りの業務の種類: ${job_category}
お困りの内容(詳細):
  ${detail || '特になし'}`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const result = await ai.models.generateContentStream({
          model: 'gemini-flash-lite-latest',
          contents: [
            { role: 'user', parts: [{ text: fewShotUserMessage }] },
            { role: 'model', parts: [{ text: fewShotModelResponse }] },
            { role: 'user', parts: [{ text: userMessage }] },
          ],
          config: {
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: 'application/json',
            responseSchema,
            systemInstruction: [{ text: systemPromptText }],
          },
        });

        let fullText = '';

        for await (const chunk of result) {
          const text = chunk.text || '';
          if (text) {
            fullText += text;
          }
        }

        // Parse the accumulated JSON and send workflow_finished
        let cases: unknown[] = [];
        try {
          const parsed = JSON.parse(fullText);
          cases = parsed.cases || [];
        } catch {
          console.error('Failed to parse Gemini response:', fullText);
        }

        const finishedEvent = JSON.stringify({
          event: 'workflow_finished',
          data: { outputs: { cases } },
        });
        controller.enqueue(encoder.encode(`data: ${finishedEvent}\n\n`));
      } catch (error) {
        console.error('Gemini streaming error:', error);
        const errorEvent = JSON.stringify({
          event: 'error',
          data: { message: 'Generation failed' },
        });
        controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
