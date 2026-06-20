// usePostActions.js - Hooks tao / sua / xoa bai viet cua customer
import { useState } from "react";
import { createPost, deletePost, updatePost } from "../api";

function getErrorMessage(error) {
  return error.response?.data?.message || error.message;
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const create = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createPost(data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  return { create, loading, error, success };
}

export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = async (id, data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updatePost(id, data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  return { update, loading, error, success };
}

export function useDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const remove = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deletePost(id);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  return { remove, loading, error, success };
}
