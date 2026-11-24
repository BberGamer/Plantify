import EmptyState from "../../common/EmptyState";
export default function DiseaseEmptyState({ search, filtered }) {
  const hasFilter = Boolean(search.trim()) || filtered;
  return <EmptyState icon={hasFilter ? "search-outline" : "bug-outline"}
    title={hasFilter ? "Không tìm thấy bệnh phù hợp" : "Chưa có bệnh cây"}
    description={hasFilter ? "Thử từ khóa hoặc trạng thái khác." : "Danh mục bệnh cây hiện đang trống."} />;
}
