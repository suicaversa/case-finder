'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, DifyCaseStudy } from '@/types';
import { generateAIComment } from '@/lib/aiComment';

interface Props {
  jobCategory: string;
  industry: string;
  consultationContent?: string;
  inquiryId?: string | null;
  displayedCases?: DifyCaseStudy[];
  initialComment?: string | null;
  existingChatMessages?: ChatMessage[];
  onInitialCommentResolved?: (comment: string) => void;
}

function AssistantAvatar() {
  return (
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
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <AssistantAvatar />
      <div className="flex-1 relative">
        <div className="absolute left-0 top-4 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-red-50" />
        <div className="bg-red-50 rounded-xl p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AIComment({ jobCategory, industry, consultationContent, inquiryId, displayedCases, initialComment: initialCommentProp, existingChatMessages, onInitialCommentResolved }: Props) {
  const fallbackComment = generateAIComment({ jobCategory, industry, consultationContent });
  const [isCommentLoading, setIsCommentLoading] = useState(!initialCommentProp);
  const onInitialCommentResolvedRef = useRef(onInitialCommentResolved);
  onInitialCommentResolvedRef.current = onInitialCommentResolved;
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 初回コメントを含めた全メッセージを一元管理
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const msgs: ChatMessage[] = [];
    if (initialCommentProp) {
      msgs.push({
        id: 'initial-comment',
        role: 'assistant',
        content: initialCommentProp,
        createdAt: new Date().toISOString(),
      });
    }
    if (existingChatMessages) {
      msgs.push(...existingChatMessages);
    }
    return msgs;
  });

  const chatMessagesRef = useRef<ChatMessage[]>(chatMessages);

  // chatMessagesRef を常に最新の chatMessages と同期させる
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  // チャットメッセージをDBに保存する
  const saveChatMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!inquiryId) return;
    try {
      await fetch(`/api/inquiries/${inquiryId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content }),
      });
    } catch (err) {
      console.error('Failed to save chat message:', err);
    }
  }, [inquiryId]);

  // 初回コメントをGemini APIから取得（DB に保存済みの場合はスキップ）
  useEffect(() => {
    if (initialCommentProp) return;
    const abortController = new AbortController();
    async function fetchInitialComment() {
      try {
        const res = await fetch('/api/ai/initial-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobCategory, industry, consultationContent }),
          signal: abortController.signal,
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const commentText = data.message || fallbackComment;
        // 初回コメントをチャット履歴の先頭に追加
        setChatMessages((prev) => [{
          id: 'initial-comment',
          role: 'assistant' as const,
          content: commentText,
          createdAt: new Date().toISOString(),
        }, ...prev]);
        onInitialCommentResolvedRef.current?.(commentText);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        // フォールバックのコメントを先頭に追加
        setChatMessages((prev) => [{
          id: 'initial-comment',
          role: 'assistant' as const,
          content: fallbackComment,
          createdAt: new Date().toISOString(),
        }, ...prev]);
      } finally {
        if (!abortController.signal.aborted) setIsCommentLoading(false);
      }
    }
    fetchInitialComment();
    return () => { abortController.abort(); };
  }, [jobCategory, industry, consultationContent, initialCommentProp, fallbackComment]);

  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBotTyping, scrollToBottom]);

  // ストリーミング中のスクロールは頻度を下げる
  const lastStreamScrollRef = useRef(0);
  useEffect(() => {
    if (!streamingText) return;
    const now = Date.now();
    if (now - lastStreamScrollRef.current > 300) {
      lastStreamScrollRef.current = now;
      scrollToBottom();
    }
  }, [streamingText, scrollToBottom]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const streamText = useCallback((fullText: string, messageId: string) => {
    let index = 0;
    setStreamingText('');

    streamingIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        setStreamingText(fullText.slice(0, index + 1));
        index++;
      } else {
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
        setStreamingText('');
        setChatMessages((prev) => [
          ...prev,
          {
            id: messageId,
            role: 'assistant',
            content: fullText,
            createdAt: new Date().toISOString(),
          },
        ]);
        setIsBotTyping(false);
        saveChatMessage('assistant', fullText);
      }
    }, 20);
  }, [saveChatMessage]);

  const callChatAPI = useCallback(async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        jobCategory,
        industry,
        consultationContent,
        displayedCases,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data.message as string;
  }, [jobCategory, industry, consultationContent, displayedCases]);

  const sendMessage = useCallback(async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isBotTyping) return;

    setError(null);
    setLastFailedMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsBotTyping(true);

    saveChatMessage('user', trimmed);

    try {
      // chatMessagesRef.current を使って、常に最新の会話履歴を取得する
      // （初回コメントも含まれているので、AIが文脈を正しく把握できる）
      const allMessages = [...chatMessagesRef.current, userMessage].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const replyText = await callChatAPI(allMessages);
      streamText(replyText, `assistant-${Date.now()}`);
    } catch {
      setIsBotTyping(false);
      setError('メッセージの送信に失敗しました。');
      setLastFailedMessage(trimmed);
    }
  }, [isBotTyping, callChatAPI, streamText, saveChatMessage]);

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      setChatMessages((prev) => {
        const updated = prev.slice(0, -1);
        chatMessagesRef.current = updated;
        return updated;
      });
      sendMessage(lastFailedMessage);
    }
  }, [lastFailedMessage, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div ref={chatContainerRef} className="space-y-3 max-h-[600px] overflow-y-auto scroll-smooth">
        {/* ローディング中 */}
        {isCommentLoading && (
          <AssistantBubble>
            <div className="flex items-center gap-2 py-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-gray-500 text-sm ml-1">AIが事例を分析中...</span>
            </div>
          </AssistantBubble>
        )}

        {/* 全メッセージ（初回コメント含む）を統一表示 */}
        {chatMessages.map((message) => (
          <div key={message.id}>
            {message.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed bg-primary text-white">
                  {message.content}
                </div>
              </div>
            ) : (
              <AssistantBubble>
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                  {message.content}
                </p>
                {message.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={message.imageUrl}
                      alt="生成された業務イメージ"
                      className="rounded-lg max-w-full h-auto border border-gray-200"
                    />
                  </div>
                )}
              </AssistantBubble>
            )}
          </div>
        ))}

        {/* Streaming text display */}
        {isBotTyping && streamingText && (
          <AssistantBubble>
            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
              {streamingText}
              <span className="inline-block w-0.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-text-bottom" />
            </p>
          </AssistantBubble>
        )}

        {/* Typing indicator (before streaming starts) */}
        {isBotTyping && !streamingText && (
          <AssistantBubble>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </AssistantBubble>
        )}

        {/* Error display with retry */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <span>{error}</span>
            {lastFailedMessage && (
              <button
                type="button"
                onClick={handleRetry}
                className="ml-auto px-3 py-1 bg-white border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors text-xs font-medium"
              >
                再送信
              </button>
            )}
          </div>
        )}
      </div>

      {/* 入力エリア */}
      {isInputOpen ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="相談内容や気になる点を入力してください（Shift+Enterで改行）"
            className="w-full bg-white px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              送信内容は担当者にも共有されます
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInputOpen(false)}
                className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                閉じる
              </button>
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
      ) : (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsInputOpen(true)}
            className="text-sm text-primary hover:text-primary-dark"
          >
            会話を続ける
          </button>
        </div>
      )}
    </div>
  );
}
