'use client';

import { useState } from 'react';
import { ChatMessage } from '@/types';
import { generateAIComment, getCategoryLabel, getIndustryLabel } from '@/lib/aiComment';

interface Props {
  jobCategory: string;
  industry: string;
  consultationContent?: string;
}

function generateChatReply(message: string, props: Props): string {
  const normalized = message.trim();
  const catMsg = getCategoryLabel(props.jobCategory);
  const indMsg = getIndustryLabel(props.industry);

  if (/(料金|費用|価格|単価|コスト)/.test(normalized)) {
    return '料金は業務量や難易度によって変わります。現状の作業量を伺いながら、最適なプランと目安をご案内します。';
  }
  if (/(導入|開始|スケジュール|期間|いつから)/.test(normalized)) {
    return '最短1〜2週間で立ち上げ可能です。必要な情報や引き継ぎ方法を整理しながら進めます。';
  }
  if (/(セキュリティ|情報|機密|NDA|権限)/i.test(normalized)) {
    return 'NDAの締結やアクセス権限の管理、作業ログの記録など、情報管理の体制を整えています。詳細は担当からご説明します。';
  }
  if (/(体制|担当|メンバー|チーム)/.test(normalized)) {
    return `${indMsg}での対応実績があるチームで進めます。${catMsg}に詳しい担当者をアサインしますので、ご安心ください。`;
  }

  return `${indMsg}の${catMsg}に合わせて柔軟に対応できます。もう少し具体的に「どの業務」「頻度」「目標」を教えていただけると、より詳しくご案内できます。`;
}

export function AIComment({ jobCategory, industry, consultationContent }: Props) {
  const comment = generateAIComment({ jobCategory, industry, consultationContent });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isBotTyping) return;

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: now,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsBotTyping(true);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateChatReply(trimmed, { jobCategory, industry, consultationContent }),
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      setIsBotTyping(false);
    }, 700);
  };

      return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">担当者</p>
        </div>

        {/* Speech bubble */}
        <div className="flex-1 space-y-3">
          <div className="relative">
            {/* Triangle pointer */}
            <div className="absolute left-0 top-4 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-red-50" />

            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{comment}</p>
            </div>
          </div>

          {isChatOpen && (
            <div className="space-y-4">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed bg-primary text-white">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 -ml-20 w-[calc(100%+5rem)]">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-1">担当者</p>
                        </div>
                        <div className="flex-1 relative">
                          <div className="absolute left-0 top-4 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-red-50" />
                          <div className="bg-red-50 rounded-xl p-4">
                            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex gap-4 -ml-20 w-[calc(100%+5rem)]">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">担当者</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="absolute left-0 top-4 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-red-50" />
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-gray-600 text-sm leading-relaxed">入力中...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  rows={3}
                  placeholder="相談内容や気になる点を入力してください"
                  className="w-full bg-white px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    送信内容は担当者にも共有されます（モック）
                  </p>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isBotTyping}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    送信する
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="text-sm text-primary hover:text-primary-dark"
            >
              {isChatOpen ? '閉じる' : '会話を続ける'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );


}
