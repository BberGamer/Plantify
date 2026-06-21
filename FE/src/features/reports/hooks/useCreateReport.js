// useCreateReport.js - Hook tao report cho bai viet
import { useState } from "react";
import { reportPost } from "../api";

function getErrorMessage(error) {
  return error.response?.data?.message || error.message;
}

export function useCreateReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createReport = async (postId, reason) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await reportPost(postId, reason);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  return { createReport, loading, error, success };
}
