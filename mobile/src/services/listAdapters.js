const invalidResponse = () => {
  const error = new Error("Dữ liệu danh sách không hợp lệ.");
  error.code = "INVALID_RESPONSE";
  throw error;
};

export const createEmptyPagination = (limit) => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

const isInteger = (value, minimum) =>
  Number.isSafeInteger(value) && value >= minimum;

function adaptList(envelope, domain) {
  if (envelope?.success === false) {
    // Giữ code/errors cho mapper lỗi; không coi envelope lỗi là một danh sách rỗng.
    const error = new Error("Không thể tải danh sách.");
    error.response = { data: envelope };
    throw error;
  }
  if (envelope?.success !== true || !envelope.data) invalidResponse();
  const data = envelope.data;
  const users = domain === "users";
  const items = users ? data.users : data.plants;
  const meta = users ? data.pagination : data;
  if (!meta || !Array.isArray(items)) invalidResponse();
  const page = users ? meta.currentPage : meta.page;
  const total = users ? meta.totalUsers : meta.total;
  const { limit, totalPages: wireTotalPages } = meta;
  if (
    !isInteger(page, 1) ||
    !isInteger(limit, 1) ||
    !isInteger(total, 0) ||
    !isInteger(wireTotalPages, 0)
  )
    invalidResponse();
  const totalPages = Math.ceil(total / limit);
  // Users v1 trả totalPages=1 khi rỗng; Plants v1 trả 0. Chỉ chuẩn hóa ở mobile.
  if (wireTotalPages !== (users ? Math.max(1, totalPages) : totalPages))
    invalidResponse();
  if (
    users &&
    (typeof meta.hasNextPage !== "boolean" ||
      typeof meta.hasPrevPage !== "boolean" ||
      meta.hasNextPage !== page < wireTotalPages ||
      meta.hasPrevPage !== page > 1)
  )
    invalidResponse();
  if (
    items.length > limit ||
    (total === 0 && items.length > 0) ||
    items.some(
      (item) =>
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        typeof item._id !== "string" ||
        !item._id,
    )
  )
    invalidResponse();
  return {
    ...envelope,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: total > 0 && page > 1,
      },
    },
  };
}

export const adaptUsersList = (envelope) => adaptList(envelope, "users");
export const adaptPlantsList = (envelope) => adaptList(envelope, "plants");

export function mapUsersParams({
  page = 1,
  limit = 10,
  search,
  role,
  status,
  sortBy,
  sortOrder,
} = {}) {
  const params = { page, limit };
  if (search !== undefined && search !== "")
    params.search = typeof search === "string" ? search.trim() : search;
  if (role !== undefined && role !== "" && role !== "all") params.role = role;
  if (status !== undefined && status !== "" && status !== "all")
    params.status = status;
  if (sortBy !== undefined) params.sortBy = sortBy;
  if (sortOrder !== undefined) params.sortOrder = sortOrder;
  return params;
}

export function mapPlantsParams({
  categoryId,
  search,
  page = 1,
  limit = 20,
} = {}) {
  const params = { page, limit };
  if (categoryId !== undefined && categoryId !== "")
    params.category_id = categoryId;
  if (search !== undefined && search !== "")
    params.search = typeof search === "string" ? search.trim() : search;
  return params;
}
