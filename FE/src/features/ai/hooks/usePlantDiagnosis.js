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

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng JPG, PNG, hoặc WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh không vượt quá 5MB.');
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
      const diagnosisResult = await diagnosePlantDisease(selectedImage);
      if (diagnosisResult?.diagnosis) {
        setResult(diagnosisResult);
        return diagnosisResult;
      } else {
        setError('Kết quả không hợp lệ từ server.');
      }
    } catch (apiError) {
      const status = apiError.response?.status;
      const serverMessage = apiError.response?.data?.message;

      if (status === 400) {
        setError(serverMessage || 'Ảnh hoặc dữ liệu chẩn đoán không hợp lệ.');
      } else if (status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (status === 413) {
        setError('Ảnh vượt quá giới hạn 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      } else if ([429, 502, 503, 504].includes(status)) {
        setError(serverMessage || 'Dịch vụ chẩn đoán AI tạm thời không khả dụng. Vui lòng thử lại sau.');
      } else if (apiError.code === 'ECONNABORTED') {
        setError('Yêu cầu chẩn đoán hết thời gian. Vui lòng thử lại.');
      } else if (!apiError.response) {
        setError('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        setError(serverMessage || 'Chẩn đoán thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }

    return null;
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
