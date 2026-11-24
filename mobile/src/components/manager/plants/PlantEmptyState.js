import EmptyState from "../../common/EmptyState";
export default function PlantEmptyState({ search }) {
  const searching = Boolean(search.trim());
  return <EmptyState icon={searching ? "search-outline" : "leaf-outline"}
    title={searching ? "Không tìm thấy cây phù hợp" : "Chưa có cây trồng"}
    description={searching ? "Thử từ khóa khác hoặc xóa nội dung tìm kiếm." : "Thêm loài cây đầu tiên của bạn."} />;
}
