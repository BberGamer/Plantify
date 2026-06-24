// useAIChat.js - Hook để gọi Gemini AI chat
import { useState } from 'react';
import { askGemini } from '../api';

/**
 * Hook để chat với Gemini AI.
 */
export function useAIChat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ask = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError('Vui lòng nhập câu hỏi cho Gemini');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await askGemini(trimmedQuestion);
      setAnswer(response || 'Gemini chưa trả về nội dung.');
    } catch (apiError) {
      setAnswer('');
      setError(apiError.response?.data?.message || 'Không thể gọi Gemini lúc này');
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setQuestion('');
    setAnswer('');
    setError('');
  };

  return {
    question,
    setQuestion,
    answer,
    error,
    isLoading,
    ask,
    clear,
  };
}
