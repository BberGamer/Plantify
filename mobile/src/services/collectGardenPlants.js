import gardenService from "./gardenService";

// Hai luồng chăm sóc và preview đều cần toàn bộ vườn, không chỉ trang đang xem.
// Caller giữ quyền quyết định request còn thuộc màn hình/ngữ cảnh hay không.
export default async function collectGardenPlants(limit, isCurrent) {
  const plants = [];
  let page = 1;
  let totalPages;
  do {
    const response = await gardenService.getPlants({ page, limit });
    if (!isCurrent()) return null;
    plants.push(...response.data.items);
    totalPages = response.data.pagination.totalPages;
    page++;
  } while (page <= totalPages);
  return plants;
}
