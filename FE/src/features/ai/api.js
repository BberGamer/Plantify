// api.js - API calls cho AI features (chat, chẩn đoán bệnh cây)
import { api } from '@/lib/api';

const AI_API = '/ai';

/**
 * Gửi ảnh lá cây để chẩn đoán bệnh.
 * @param {File} file - File ảnh upload
 * @returns {Promise<{classId: number, label: string, confidence: number}>}
 */
export async function diagnosePlantDisease(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`${AI_API}/diagnose`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
  });

  return response.data?.data?.prediction;
}

/**
 * Gửi câu hỏi cho Gemini AI.
 * @param {string} prompt - Câu hỏi từ user
 * @returns {Promise<string>} - Phản hồi từ Gemini
 */
export async function askGemini(prompt) {
  const response = await api.post(`${AI_API}/chat`, { prompt });
  return response.data?.data?.text;
}
