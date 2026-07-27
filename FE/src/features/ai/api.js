// api.js - API calls cho AI features (chat, chẩn đoán bệnh cây)
import { api } from '@/lib/api';
import { buildDiagnosisFormData } from './diagnosisRequest.utils';

const AI_API = '/ai';

/**
 * Gửi ảnh lá cây để chẩn đoán bệnh.
 * @param {File} file - File ảnh upload
 * @param {{userPlantId?: string}} references
 * @returns {Promise<{
 *   diagnosis: object,
 *   diseaseInfo: object|null,
 *   recommendations: object,
 *   recommendedProducts: object[],
 *   diagnosisHistoryId: string,
 *   createdAt: string
 * }>}
 */
export async function diagnosePlantDisease(file, references = {}) {
  const formData = buildDiagnosisFormData(file, references);

  const response = await api.post(`${AI_API}/diagnose`, formData, {
    timeout: 60000,
  });

  return response.data.data;
}

/**
 * Gửi câu hỏi cho AI.
 * @param {string} prompt - Câu hỏi từ user
 * @returns {Promise<string>} - Phản hồi từ AI
 */
export async function askAI(prompt) {
  const response = await api.post(`${AI_API}/chat`, { prompt });
  return response.data?.data?.text;
}
