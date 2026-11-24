export const baseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");
let token = null;
let generation = 0;
export function setToken(value) {
  token = value;
  generation++;
}
export async function api(
  path,
  { method = "GET", body, signal, blob = false } = {},
) {
  const version = generation;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, 90000);
  try {
    const multipart = body instanceof FormData;
    const response = await fetch(baseURL + path, {
      method,
      signal: controller.signal,
      headers: {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(!multipart && body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        body === undefined
          ? undefined
          : multipart
            ? body
            : JSON.stringify(body),
    });
    if (version !== generation)
      throw new DOMException("Phiên đã thay đổi", "AbortError");
    if (response.status === 401 && token)
      window.dispatchEvent(new Event("plantify:unauthorized"));
    if (blob && response.ok) return response.blob();
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true)
      throw new Error(
        result?.message || "Không thể xử lý yêu cầu. Vui lòng thử lại.",
      );
    return result.data;
  } catch (error) {
    if (error.name === "TypeError")
      throw new Error(
        "Không kết nối được backend. Kiểm tra API và kết nối mạng.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
export const params = (values) => {
  const query = new URLSearchParams(
    Object.entries(values).filter(([, value]) => value !== "" && value != null),
  );
  return query.size ? "?" + query : "";
};
export const itemsOf = (data) =>
  Array.isArray(data)
    ? data
    : data?.items ||
      data?.users ||
      data?.plants ||
      data?.diseases ||
      data?.feedbacks ||
      data?.protocols ||
      [];
export async function allItems(path) {
  const first = await api(path + params({ page: 1, limit: 100 }));
  const pages = first?.totalPages ?? first?.pagination?.totalPages ?? 1;
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      api(path + params({ page: i + 2, limit: 100 })),
    ),
  );
  return [first, ...rest].flatMap(itemsOf);
}
