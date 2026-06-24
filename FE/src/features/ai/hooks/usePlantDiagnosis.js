// usePlantDiagnosis.js - Hook để chẩn đoán bệnh cây
import { useState } from 'react';
import { diagnosePlantDisease } from '../api';

/**
 * Hook để chẩn đoán bệnh cây từ ảnh.
 */
export function usePlantDiagnosis() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const processFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng JPG, PNG, hoặc WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const diagnose = async () => {
    if (!selectedImage) {
      setError('Vui lòng chọn ảnh lá cây để chẩn đoán.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const prediction = await diagnosePlantDisease(selectedImage);
      if (prediction) {
        setResult({
          label: prediction.label,
          confidence: prediction.confidence,
        });
      } else {
        setError('Kết quả không hợp lệ từ server.');
      }
    } catch (apiError) {
      const errorMsg = apiError.response?.data?.message || apiError.message;
      if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('AI service')) {
        setError('AI service không khả dụng. Vui lòng khởi động AI Service (FastAPI).');
      } else if (apiError.code === 'ECONNABORTED') {
        setError('Yêu cầu chẩn đoán hết thời gian. Vui lòng thử lại.');
      } else {
        setError(errorMsg || 'Chẩn đoán thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    setError('');
  };

  return {
    selectedImage,
    previewUrl,
    result,
    error,
    isLoading,
    processFile,
    diagnose,
    clear,
  };
}
