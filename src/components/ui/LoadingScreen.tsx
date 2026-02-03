'use client';

import { useEffect, useState } from 'react';

const messages = [
  '入力内容を分析しています...',
  '近い事例を探しています...',
  'おすすめの事例を選定中...',
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Message */}
        <p className="text-lg text-gray-700 font-medium">{messages[messageIndex]}</p>
        <p className="text-sm text-gray-500 mt-2">AIが最適な事例を生成しています</p>
      </div>
    </div>
  );
}
