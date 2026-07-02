// useAIChat.js - Hook để gọi AI chat
import { useState } from 'react';
import { askAI } from '../api';

/**
 * Hook để chat với AI.
 */
export function useAIChat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ask = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError('Vui lòng nhập câu hỏi cho AI');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await askAI(trimmedQuestion);
      setAnswer(response || 'AI chưa trả về nội dung.');
    } catch (apiError) {
      setAnswer('');
      setError(apiError.response?.data?.message || 'Không thể gọi AI lúc này');
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
